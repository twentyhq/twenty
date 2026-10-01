import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Who can sign in or join, and with which role: an installed application never
// changes these, whatever its role allows.
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
} as const satisfies Partial<Record<keyof WorkspaceEntity, true>>;
