import type {
  FieldPermissionManifest,
  ObjectPermissionManifest,
  RoleManifest,
  RowLevelPermissionPredicateManifest,
} from 'twenty-shared/application';

export type RoleConfig = Omit<
  RoleManifest,
  'objectPermissions' | 'fieldPermissions' | 'rowLevelPermissionPredicates'
> & {
  objectPermissions?: Omit<ObjectPermissionManifest, 'universalIdentifier'>[];
  fieldPermissions?: Omit<FieldPermissionManifest, 'universalIdentifier'>[];
  rowLevelPermissionPredicates?: Omit<
    RowLevelPermissionPredicateManifest,
    'universalIdentifier'
  >[];
};
