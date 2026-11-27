import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOverrideNewRuleButton } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideNewRuleButton';
import { SettingsRolePermissionsObjectOverrideOperationRow } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideOperationRow';
import { SettingsRolePermissionsObjectOverrideRuleRow } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideRuleRow';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-overrides/constants/ObjectOverridePanelGridTemplateColumns';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/object-overrides/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { getObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectRowLevelPermissionRules';
import { hasObjectFieldRestriction } from '@/settings/roles/role-permissions/object-overrides/utils/hasObjectFieldRestriction';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPanel = styled.div`
  margin: calc(
      ${themeCssVariables.spacing[2]} + ${themeCssVariables.spacing['0.5']}
    )
    0 ${themeCssVariables.spacing[2]};
`;

const StyledPanelSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledAllRecordsHeader = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectOverridePanelProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectOverridePanel = ({
  roleId,
  objectMetadataItem,
  isEditable,
}: SettingsRolePermissionsObjectOverridePanelProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { removeObjectOverride } = useSettingsRoleObjectOverrides(roleId);

  const { disabledOperations, getDisabledOperationReason } =
    useObjectDisabledOperations(objectMetadataItem);

  const rules = getObjectRowLevelPermissionRules({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
    disabledOperations,
  });

  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  const hasFullObjectAccess =
    SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.every(
      (key) => disabledOperations.includes(key) || operations.includes(key),
    ) &&
    !hasObjectFieldRestriction({
      role: settingsDraftRole,
      objectMetadataId: objectMetadataItem.id,
    });

  const getRuleOnlyHint = (operation: SettingsRoleObjectPermissionKey) => {
    const ruleCount = rules.filter(({ rule }) =>
      getRecordsGrantOperations({ recordsGrant: rule }).includes(operation),
    ).length;

    if (operations.includes(operation) || ruleCount === 0) {
      return null;
    }

    const throughRules = plural(ruleCount, {
      one: `through # record-level permission`,
      other: `through # record-level permissions`,
    });

    switch (operation) {
      case 'canReadObjectRecords':
        return t`See some ${objectLabelPlural} · ${throughRules}`;
      case 'canUpdateObjectRecords':
        return t`Edit some ${objectLabelPlural} · ${throughRules}`;
      case 'canSoftDeleteObjectRecords':
        return t`Delete some ${objectLabelPlural} · ${throughRules}`;
      case 'canDestroyObjectRecords':
        return t`Destroy some ${objectLabelPlural} · ${throughRules}`;
    }
  };

  return (
    <StyledPanel>
      <Card.Root variant="compact">
        <Card.Content>
          <StyledPanelSections>
            <div>
              <StyledAllRecordsHeader>
                <TableRow
                  gridTemplateColumns={
                    OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS
                  }
                >
                  <TableHeader>{t`All records`}</TableHeader>
                  <TableHeader>{t`Allows`}</TableHeader>
                  <TableHeader
                    align="right"
                    padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
                  >
                    {isEditable && (
                      <LightIconButton
                        aria-label={t`Remove override`}
                        onClick={() =>
                          removeObjectOverride(objectMetadataItem.id)
                        }
                      >
                        <IconTrash />
                      </LightIconButton>
                    )}
                  </TableHeader>
                </TableRow>
              </StyledAllRecordsHeader>
              <TableBody>
                {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((operation) => {
                  const disabledReason = getDisabledOperationReason(operation);

                  return (
                    <SettingsRolePermissionsObjectOverrideOperationRow
                      key={operation}
                      roleId={roleId}
                      objectMetadataItem={objectMetadataItem}
                      operation={operation}
                      hint={disabledReason ?? getRuleOnlyHint(operation)}
                      isEditable={isEditable}
                      isOperationEnabled={!isDefined(disabledReason)}
                    />
                  );
                })}
              </TableBody>
            </div>
            {(rules.length > 0 || isEditable) && (
              <div>
                {rules.length > 0 && (
                  <>
                    <TableRow
                      gridTemplateColumns={
                        OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS
                      }
                    >
                      <TableHeader>{t`Some records`}</TableHeader>
                      <TableHeader>{t`Allows`}</TableHeader>
                      <TableHeader />
                    </TableRow>
                    <TableBody>
                      {rules.map(({ rule, predicates }) => (
                        <SettingsRolePermissionsObjectOverrideRuleRow
                          key={rule.id}
                          roleId={roleId}
                          objectMetadataItem={objectMetadataItem}
                          rule={rule}
                          predicates={predicates}
                          isEditable={isEditable}
                        />
                      ))}
                    </TableBody>
                  </>
                )}
                {isEditable && (
                  <TableFooter>
                    <SettingsRolePermissionsObjectOverrideNewRuleButton
                      roleId={roleId}
                      objectMetadataItem={objectMetadataItem}
                      hasFullObjectAccess={hasFullObjectAccess}
                    />
                  </TableFooter>
                )}
              </div>
            )}
          </StyledPanelSections>
        </Card.Content>
      </Card.Root>
    </StyledPanel>
  );
};
