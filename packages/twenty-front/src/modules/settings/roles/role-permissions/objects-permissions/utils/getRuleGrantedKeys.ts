import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type RowLevelPermissionPredicateGroup } from '~/generated-metadata/graphql';

export const getRuleGrantedKeys = (
  rootPredicateGroup: Pick<
    RowLevelPermissionPredicateGroup,
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >,
): SettingsRoleObjectPermissionKey[] => [
  ...(rootPredicateGroup.canReadRecords
    ? (['canReadObjectRecords'] as const)
    : []),
  ...(rootPredicateGroup.canUpdateRecords
    ? (['canUpdateObjectRecords'] as const)
    : []),
  ...(rootPredicateGroup.canSoftDeleteRecords
    ? (['canSoftDeleteObjectRecords'] as const)
    : []),
  ...(rootPredicateGroup.canDestroyRecords
    ? (['canDestroyObjectRecords'] as const)
    : []),
];
