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
  // Predicate universalIdentifiers are derived deterministically at build time. Predicate
  // groups keep their explicit universalIdentifier so predicates can reference them.
  rowLevelPermissionPredicates?: Omit<
    RowLevelPermissionPredicateManifest,
    'universalIdentifier'
  >[];
};
