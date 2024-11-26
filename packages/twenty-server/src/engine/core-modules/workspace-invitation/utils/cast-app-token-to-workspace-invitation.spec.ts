import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

import { castAppTokenToWorkspaceInvitationUtil } from './cast-app-token-to-workspace-invitation.util';

describe('castAppTokenToWorkspaceInvitation', () => {
  it('should throw an error if token type is not InvitationToken', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.RefreshToken,
      context: { email: 'test@example.com' },
      expiresAt: new Date(),
    } as AppToken;

    expect(() => castAppTokenToWorkspaceInvitationUtil(appToken)).toThrowError(
      new WorkspaceInvitationException(
        `Token type must be "${AppTokenType.InvitationToken}"`,
        WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE,
      ),
    );
  });

  it('should throw an error if context email is missing', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.InvitationToken,
      context: null,
      expiresAt: new Date(),
    } as AppToken;

    expect(() => castAppTokenToWorkspaceInvitationUtil(appToken)).toThrowError(
      new WorkspaceInvitationException(
        `Invitation corrupted: Missing email in context`,
        WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED,
      ),
    );
  });

  it('should return the correct invitation object for valid inputs', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.InvitationToken,
      context: { email: 'test@example.com' },
      expiresAt: new Date(),
    } as AppToken;

    const invitation = castAppTokenToWorkspaceInvitationUtil(appToken);

    expect(invitation).toEqual({
      id: '1',
      email: 'test@example.com',
      expiresAt: appToken.expiresAt,
    });
  });
});
