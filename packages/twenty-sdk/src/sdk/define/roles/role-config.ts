import type {
  FieldPermissionManifest,
  ObjectPermissionManifest,
  RoleManifest,
} from 'twenty-shared/application';
import { type PermissionFlagType } from 'twenty-shared/constants';

export type RoleConfig = Omit<
  RoleManifest,
  'objectPermissions' | 'fieldPermissions' | 'permissionFlags'
> & {
  objectPermissions?: Omit<ObjectPermissionManifest, 'universalIdentifier'>[];
  fieldPermissions?: Omit<FieldPermissionManifest, 'universalIdentifier'>[];
  permissionFlags?: PermissionFlagType[];
};
