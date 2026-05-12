import type {
  FieldPermissionManifest,
  ObjectPermissionManifest,
  RoleManifest,
  RowLevelPermissionPredicateGroupManifest,
  RowLevelPermissionPredicateManifest,
} from 'twenty-shared/application';
import { type PermissionFlagType } from 'twenty-shared/constants';

export type RowLevelPermissionPredicateGroupConfig = Omit<
  RowLevelPermissionPredicateGroupManifest,
  'universalIdentifier'
> & {
  universalIdentifier?: string;
};

export type RowLevelPermissionPredicateConfig = Omit<
  RowLevelPermissionPredicateManifest,
  'universalIdentifier'
> & {
  universalIdentifier?: string;
};

export type RoleConfig = Omit<
  RoleManifest,
  | 'objectPermissions'
  | 'fieldPermissions'
  | 'rowLevelPermissionPredicateGroups'
  | 'rowLevelPermissionPredicates'
> & {
  objectPermissions?: Omit<ObjectPermissionManifest, 'universalIdentifier'>[];
  fieldPermissions?: Omit<FieldPermissionManifest, 'universalIdentifier'>[];
  permissionFlags?: PermissionFlagType[];
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupConfig[];
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateConfig[];
};
