import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

export const castAppTokenToWorkspaceInvitationUtil = (appToken: AppToken) => {
  if (appToken.type !== AppTokenType.InvitationToken) {
    throw new WorkspaceInvitationException(
      `Token type must be "${AppTokenType.InvitationToken}"`,
      WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE,
    );
  }

  if (!appToken.context?.email) {
    throw new WorkspaceInvitationException(
      `Invitation corrupted: Missing email in context`,
      WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED,
    );
  }

  return {
    id: appToken.id,
    email: appToken.context.email,
    expiresAt: appToken.expiresAt,
  };
};
