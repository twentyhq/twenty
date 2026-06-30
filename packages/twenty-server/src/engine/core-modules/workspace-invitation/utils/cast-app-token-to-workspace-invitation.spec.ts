import {
  type AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { INVITATION_APP_TOKEN_TYPES } from 'src/engine/core-modules/workspace-invitation/constants/invitation-app-token-types';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';

import { castAppTokenToWorkspaceInvitationUtil } from './cast-app-token-to-workspace-invitation.util';

describe('castAppTokenToWorkspaceInvitation', () => {
  it('should throw an error if token type is not an invitation token', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.RefreshToken,
      context: { email: 'test@example.com' },
      expiresAt: new Date(),
    } as AppTokenEntity;

    expect(() => castAppTokenToWorkspaceInvitationUtil(appToken)).toThrowError(
      new WorkspaceInvitationException(
        `Token type must be one of "${INVITATION_APP_TOKEN_TYPES.join('", "')}"`,
        WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE,
      ),
    );
  });

  it('should return the invitation object for an onboarding invitation token', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.OnboardingInvitationToken,
      context: { email: 'test@example.com' },
      expiresAt: new Date(),
    } as AppTokenEntity;

    const invitation = castAppTokenToWorkspaceInvitationUtil(appToken);

    expect(invitation).toEqual({
      id: '1',
      email: 'test@example.com',
      roleId: null,
      expiresAt: appToken.expiresAt,
    });
  });

  it('should throw an error if context email is missing', () => {
    const appToken = {
      id: '1',
      type: AppTokenType.InvitationToken,
      context: null,
      expiresAt: new Date(),
    } as AppTokenEntity;

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
    } as AppTokenEntity;

    const invitation = castAppTokenToWorkspaceInvitationUtil(appToken);

    expect(invitation).toEqual({
      id: '1',
      email: 'test@example.com',
      roleId: null,
      expiresAt: appToken.expiresAt,
    });
  });
});
