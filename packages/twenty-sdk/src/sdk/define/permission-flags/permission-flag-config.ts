import { type PermissionFlagManifest } from 'twenty-shared/application';

export type PermissionFlagConfig = Omit<PermissionFlagManifest, 'permissionType'>;
