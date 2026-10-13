import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const WORKSPACE_FIELDS_NOT_UPDATABLE_BY_APPLICATIONS = {
  defaultRoleId: true,
  inviteHash: true,
  isPublicInviteLinkEnabled: true,
  workspaceDiscoverability: true,
  allowImpersonation: true,
  isGoogleAuthEnabled: true,
  isMicrosoftAuthEnabled: true,
  isPasswordAuthEnabled: true,
  isTwoFactorAuthenticationEnforced: true,
  editableProfileFields: true,
  subdomain: true,
  customDomain: true,
  eventLogRetentionDays: true,
} as const satisfies Partial<Record<keyof WorkspaceEntity, true>>;
