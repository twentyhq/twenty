import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

export const USER_WORKSPACE_ENTITY_NON_CACHED_PROPERTIES = [
  'workspace',
  'user',
  'twoFactorAuthenticationMethods',
  'permissionFlags',
  'objectRecordsPermissions',
  'twoFactorAuthenticationMethodSummary',
  'inboxNotificationLevel',
  'isInboxNotificationPreviewEnabled',
  'defaultAvatarUrl',
  'defaultAvatarFileId',
  'defaultAvatarFile',
] as const satisfies ReadonlyArray<keyof UserWorkspaceEntity>;
