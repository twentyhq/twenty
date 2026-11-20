import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsWithReadDependency';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { type RowLevelPermissionRule } from '~/generated-metadata/graphql';

type SettingsRoleRuleAllowsSectionProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  rule: RowLevelPermissionRule;
};

export const SettingsRoleRuleAllowsSection = ({
  roleId,
  objectMetadataItem,
  rule,
}: SettingsRoleRuleAllowsSectionProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { setRuleOperations } = useRowLevelPermissionRulesInDraftRole(roleId);

  const { disabledOperations, getDisabledOperationReason } =
    useObjectDisabledOperations(objectMetadataItem);

  const isOperationEnabled = (operation: SettingsRoleObjectPermissionKey) =>
    !disabledOperations.includes(operation);

  const roleLabel = settingsDraftRole.label;
  const objectLabelSingular =
    objectMetadataItem.labelSingular.toLocaleLowerCase();
  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  const allRecordsOperations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
    disabledOperations,
  });
  const ruleOperations = getRecordsGrantOperations({
    recordsGrant: rule,
    disabledOperations,
  });

  const getDescription = (operation: SettingsRoleObjectPermissionKey) => {
    const disabledReason = getDisabledOperationReason(operation);

    if (isDefined(disabledReason)) {
      return disabledReason;
    }

    const isAllowedOnAllRecords = allRecordsOperations.includes(operation);

    switch (operation) {
      case 'canReadObjectRecords':
        return isAllowedOnAllRecords
          ? t`${roleLabel} already sees every ${objectLabelSingular}`
          : t`See matching ${objectLabelPlural}`;
      case 'canUpdateObjectRecords':
        return isAllowedOnAllRecords
          ? t`${roleLabel} already edits every ${objectLabelSingular}`
          : t`Edit matching ${objectLabelPlural}`;
      case 'canSoftDeleteObjectRecords':
        return isAllowedOnAllRecords
          ? t`${roleLabel} already deletes every ${objectLabelSingular}`
          : t`Delete matching ${objectLabelPlural}`;
      case 'canDestroyObjectRecords':
        return isAllowedOnAllRecords
          ? t`${roleLabel} already destroys every ${objectLabelSingular}`
          : t`Destroy matching ${objectLabelPlural}`;
    }
  };

  const toggleOperation = (operation: SettingsRoleObjectPermissionKey) => {
    setRuleOperations({
      rowLevelPermissionRuleId: rule.id,
      operations: getObjectOperationsWithReadDependency({
        disabledOperations,
        previousOperations: ruleOperations,
        nextOperations: ruleOperations.includes(operation)
          ? ruleOperations.filter(
              (ruleOperation) => ruleOperation !== operation,
            )
          : [...ruleOperations, operation],
      }),
    });
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Allows`}
        description={t`What ${roleLabel} can do on ${objectLabelPlural} matching this rule.`}
      />
      <Card.Root>
        {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((operation, index) => {
          const isAllowedOnAllRecords =
            allRecordsOperations.includes(operation);

          return (
            <SettingsOptionCardContentSwitch
              key={operation}
              Icon={SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[operation].Icon}
              title={t(
                SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[operation].label,
              )}
              description={getDescription(operation)}
              divider={index < SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.length - 1}
              checked={
                isAllowedOnAllRecords || ruleOperations.includes(operation)
              }
              disabled={
                !settingsDraftRole.isEditable ||
                isAllowedOnAllRecords ||
                !isOperationEnabled(operation)
              }
              onChange={() => toggleOperation(operation)}
            />
          );
        })}
      </Card.Root>
    </Section.Root>
  );
};
