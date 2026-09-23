import { type PermissionFlag } from '~/generated-metadata/graphql';

export type FlatPermissionFlag = Pick<
  PermissionFlag,
  | 'id'
  | 'applicationId'
  | 'key'
  | 'label'
  | 'description'
  | 'icon'
  | 'permissionType'
>;
