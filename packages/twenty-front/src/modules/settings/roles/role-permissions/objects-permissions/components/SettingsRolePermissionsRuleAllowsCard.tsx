import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectPermissionActionLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionLabel';
import { getObjectPermissionKeysWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionKeysWithReadDependency';
import { getRuleGrantedKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getRuleGrantedKeys';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';

type SettingsRolePermissionsRuleAllowsCardProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  ruleRootGroupId: string;
};

export const SettingsRolePermissionsRuleAllowsCard = ({
  roleId,
  objectMetadataItem,
  ruleRootGroupId,
}: SettingsRolePermissionsRuleAllowsCardProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const { setRuleGrantedKeys } = useRowLevelPermissionRulesInDraftRole(roleId);

  const rootPredicateGroup =
    settingsDraftRole.rowLevelPermissionPredicateGroups?.find(
      (predicateGroup) => predicateGroup.id === ruleRootGroupId,
    );

  if (!isDefined(rootPredicateGroup)) {
    return null;
  }

  const roleLabel = settingsDraftRole.label;
  const objectLabelSingular =
    objectMetadataItem.labelSingular.toLocaleLowerCase();
  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  const allRecordsGrantedKeys = getGrantedObjectPermissionKeys({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });
  const ruleGrantedKeys = getRuleGrantedKeys(rootPredicateGroup);

  const getDescription = (key: SettingsRoleObjectPermissionKey) => {
    const isGrantedOnAllRecords = allRecordsGrantedKeys.includes(key);

    switch (key) {
      case 'canReadObjectRecords':
        return isGrantedOnAllRecords
          ? t`${roleLabel} already sees every ${objectLabelSingular}`
          : t`See matching ${objectLabelPlural}`;
      case 'canUpdateObjectRecords':
        return isGrantedOnAllRecords
          ? t`${roleLabel} already edits every ${objectLabelSingular}`
          : t`Edit matching ${objectLabelPlural}`;
      case 'canSoftDeleteObjectRecords':
        return isGrantedOnAllRecords
          ? t`${roleLabel} already deletes every ${objectLabelSingular}`
          : t`Delete matching ${objectLabelPlural}`;
      case 'canDestroyObjectRecords':
        return isGrantedOnAllRecords
          ? t`${roleLabel} already destroys every ${objectLabelSingular}`
          : t`Destroy matching ${objectLabelPlural}`;
    }
  };

  const toggleKey = (key: SettingsRoleObjectPermissionKey) => {
    setRuleGrantedKeys({
      rootPredicateGroupId: ruleRootGroupId,
      grantedKeys: getObjectPermissionKeysWithReadDependency({
        previousKeys: ruleGrantedKeys,
        nextKeys: ruleGrantedKeys.includes(key)
          ? ruleGrantedKeys.filter((grantedKey) => grantedKey !== key)
          : [...ruleGrantedKeys, key],
      }),
    });
  };

  return (
    <Card.Root>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key, index) => {
        const isGrantedOnAllRecords = allRecordsGrantedKeys.includes(key);

        return (
          <SettingsOptionCardContentSwitch
            key={key}
            Icon={SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].Icon}
            title={getObjectPermissionActionLabel(key)}
            description={getDescription(key)}
            divider={index < SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.length - 1}
            checked={isGrantedOnAllRecords || ruleGrantedKeys.includes(key)}
            disabled={!settingsDraftRole.isEditable || isGrantedOnAllRecords}
            onChange={() => toggleKey(key)}
          />
        );
      })}
    </Card.Root>
  );
};
