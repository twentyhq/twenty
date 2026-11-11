import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { SettingsRolePermissionsObjectActionsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectActionsSelect';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectFieldsSelect';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSettingsRoleObjectOverrides';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectPermissionActionLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionLabel';
import { getObjectPermissionKeysWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionKeysWithReadDependency';
import { getObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionRules';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getRowLevelPermissionRuleLabel';
import { getRuleGrantedKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getRuleGrantedKeys';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { SettingsPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS};
`;

const StyledActionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[1]};
`;

type SettingsRolePermissionsObjectOverridePanelProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectOverridePanel = ({
  roleId,
  objectMetadataItem,
  isEditable,
  fromAgentId,
}: SettingsRolePermissionsObjectOverridePanelProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const { createRule, setRuleGrantedKeys } =
    useRowLevelPermissionRulesInDraftRole(roleId);

  const { removeObjectOverride } = useSettingsRoleObjectOverrides(roleId);

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
    });

  const rules = getObjectRowLevelPermissionRules({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const grantedKeys = getGrantedObjectPermissionKeys({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  // a grant equal to the all-objects one stays inherited, so it keeps following that setting
  const setGrantedKeys = (
    nextGrantedKeys: SettingsRoleObjectPermissionKey[],
  ) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermission) =>
        objectPermission.objectMetadataId === objectMetadataItem.id,
    );

    const objectGrants = Object.fromEntries(
      SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const isGranted = nextGrantedKeys.includes(key);
        const allObjectsGrant =
          settingsDraftRole[
            SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
              key
            ]
          ];

        return [key, isGranted === allObjectsGrant ? null : isGranted];
      }),
    );

    upsertObjectPermissionInDraftRole({
      ...existingObjectPermission,
      objectMetadataId: objectMetadataItem.id,
      ...objectGrants,
    });
  };

  const toggleKey = (key: SettingsRoleObjectPermissionKey) => {
    const nextKeys = grantedKeys.includes(key)
      ? grantedKeys.filter((grantedKey) => grantedKey !== key)
      : [...grantedKeys, key];

    setGrantedKeys(
      getObjectPermissionKeysWithReadDependency({
        previousKeys: grantedKeys,
        nextKeys,
      }),
    );
  };

  const openRuleEditor = (rootPredicateGroupId: string) => {
    navigateSettings(
      SettingsPath.RoleObjectLevel,
      { roleId, objectMetadataId: objectMetadataItem.id },
      {
        ruleId: rootPredicateGroupId,
        ...(isDefined(fromAgentId) ? { fromAgent: fromAgentId } : {}),
      },
    );
  };

  const handleNewRule = () => {
    openRuleEditor(createRule(objectMetadataItem.id));
  };

  return (
    <StyledPanel>
      <StyledHeaderRow>
        <TableHeader>{t`All records`}</TableHeader>
        <TableHeader>{t`Allows`}</TableHeader>
        <TableHeader />
      </StyledHeaderRow>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key];
        const isFieldsSelectShown =
          key === 'canReadObjectRecords' || key === 'canUpdateObjectRecords';

        return (
          <TableRow
            key={key}
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
          >
            <TableCell gap={themeCssVariables.spacing[2]}>
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              <StyledActionLabel>
                {getObjectPermissionActionLabel(key)}
              </StyledActionLabel>
            </TableCell>
            <TableCell>
              {isFieldsSelectShown && (
                <SettingsRolePermissionsObjectFieldsSelect
                  roleId={roleId}
                  objectMetadataItem={objectMetadataItem}
                  mode={key === 'canReadObjectRecords' ? 'read' : 'update'}
                  disabled={!isEditable || !grantedKeys.includes(key)}
                />
              )}
            </TableCell>
            <TableCell align="right">
              <Checkbox
                checked={grantedKeys.includes(key)}
                disabled={!isEditable}
                onCheckedChange={() => toggleKey(key)}
              />
            </TableCell>
          </TableRow>
        );
      })}
      {rules.length > 0 && (
        <>
          <StyledHeaderRow>
            <TableHeader>{t`Some records`}</TableHeader>
            <TableHeader>{t`Allows`}</TableHeader>
            <TableHeader />
          </StyledHeaderRow>
          {rules.map(({ rootPredicateGroup, predicates }) => {
            const ruleLabel = getRowLevelPermissionRuleLabel({
              predicates,
              objectMetadataItem,
              workspaceMemberObjectMetadataItem,
            });

            return (
              <TableRow
                key={rootPredicateGroup.id}
                gridTemplateColumns={
                  OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS
                }
                onClick={
                  isEditable
                    ? () => openRuleEditor(rootPredicateGroup.id)
                    : undefined
                }
              >
                <TableCell
                  color={
                    isNonEmptyString(ruleLabel)
                      ? themeCssVariables.font.color.primary
                      : themeCssVariables.font.color.tertiary
                  }
                  overflow="hidden"
                >
                  <OverflowingTextWithTooltip
                    text={
                      isNonEmptyString(ruleLabel) ? ruleLabel : t`No filter`
                    }
                  />
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <SettingsRolePermissionsObjectActionsSelect
                    dropdownId={`settings-role-rule-actions-${rootPredicateGroup.id}`}
                    selectedKeys={getRuleGrantedKeys(rootPredicateGroup)}
                    onChange={(selectedKeys) =>
                      setRuleGrantedKeys({
                        rootPredicateGroupId: rootPredicateGroup.id,
                        grantedKeys: selectedKeys,
                      })
                    }
                    disabled={!isEditable}
                  />
                </TableCell>
                <TableCell
                  align="right"
                  color={themeCssVariables.font.color.tertiary}
                >
                  {isEditable && <IconChevronRight size={theme.icon.size.md} />}
                </TableCell>
              </TableRow>
            );
          })}
        </>
      )}
      {isEditable && (
        <StyledFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => removeObjectOverride(objectMetadataItem.id)}
          >
            {t`Remove override`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconPlus />}
            onClick={handleNewRule}
          >
            {t`New rule`}
          </Button>
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
