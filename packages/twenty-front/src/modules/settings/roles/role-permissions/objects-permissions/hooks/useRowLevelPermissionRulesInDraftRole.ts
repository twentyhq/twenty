import { isInPredicateGroups } from '@/settings/roles/role-permissions/objects-permissions/utils/isInPredicateGroups';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { v4 } from 'uuid';
import { RowLevelPermissionPredicateGroupLogicalOperator } from '~/generated-metadata/graphql';

export const useRowLevelPermissionRulesInDraftRole = (roleId: string) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const createRule = (objectMetadataId: string) => {
    const rootPredicateGroupId = v4();

    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      rowLevelPermissionPredicateGroups: [
        ...(currentSettingsDraftRole.rowLevelPermissionPredicateGroups ?? []),
        {
          __typename: 'RowLevelPermissionPredicateGroup',
          id: rootPredicateGroupId,
          parentRowLevelPermissionPredicateGroupId: null,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          positionInRowLevelPermissionPredicateGroup: null,
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
          roleId,
          objectMetadataId,
          rowLevelPermissionRuleId: null,
        },
      ],
    }));

    return rootPredicateGroupId;
  };

  const setRuleGrantedKeys = ({
    rootPredicateGroupId,
    grantedKeys,
  }: {
    rootPredicateGroupId: string;
    grantedKeys: SettingsRoleObjectPermissionKey[];
  }) => {
    setSettingsDraftRole((currentSettingsDraftRole) => ({
      ...currentSettingsDraftRole,
      rowLevelPermissionPredicateGroups: (
        currentSettingsDraftRole.rowLevelPermissionPredicateGroups ?? []
      ).map((predicateGroup) =>
        predicateGroup.id === rootPredicateGroupId
          ? {
              ...predicateGroup,
              canReadRecords: grantedKeys.includes('canReadObjectRecords'),
              canUpdateRecords: grantedKeys.includes('canUpdateObjectRecords'),
              canSoftDeleteRecords: grantedKeys.includes(
                'canSoftDeleteObjectRecords',
              ),
              canDestroyRecords: grantedKeys.includes(
                'canDestroyObjectRecords',
              ),
            }
          : predicateGroup,
      ),
    }));
  };

  const deleteRule = (rootPredicateGroupId: string) => {
    setSettingsDraftRole((currentSettingsDraftRole) => {
      const predicateGroups =
        currentSettingsDraftRole.rowLevelPermissionPredicateGroups ?? [];
      const deletedPredicateGroupIds = getRulePredicateGroupIds({
        predicateGroups,
        ruleRootGroupId: rootPredicateGroupId,
      });

      return {
        ...currentSettingsDraftRole,
        rowLevelPermissionPredicateGroups: predicateGroups.filter(
          (predicateGroup) => !deletedPredicateGroupIds.has(predicateGroup.id),
        ),
        fieldPermissions: currentSettingsDraftRole.fieldPermissions?.filter(
          ({ rowLevelPermissionPredicateGroupId }) =>
            !isInPredicateGroups({
              rowLevelPermissionPredicateGroupId,
              predicateGroupIds: deletedPredicateGroupIds,
            }),
        ),
        rowLevelPermissionPredicates: (
          currentSettingsDraftRole.rowLevelPermissionPredicates ?? []
        ).filter(
          ({ rowLevelPermissionPredicateGroupId }) =>
            !isInPredicateGroups({
              rowLevelPermissionPredicateGroupId,
              predicateGroupIds: deletedPredicateGroupIds,
            }),
        ),
      };
    });
  };

  return { createRule, setRuleGrantedKeys, deleteRule };
};
