import type {
  FieldPermissionManifest,
  ObjectPermissionManifest,
  RoleManifest,
} from 'twenty-shared/application';

export type RoleConfig = Omit<
  RoleManifest,
  'objectPermissions' | 'fieldPermissions'
> & {
  objectPermissions?: Omit<ObjectPermissionManifest, 'universalIdentifier'>[];
  fieldPermissions?: Omit<FieldPermissionManifest, 'universalIdentifier'>[];
};
