import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

import { UserSessionService } from './user-session.service';

describe('UserSessionService.issueSessionForTokenPair', () => {
  const userSessionRepository = {
    create: jest.fn((input) => input),
    save: jest.fn(),
  };
  const jwtWrapperService = {
    decode: jest.fn().mockReturnValue({
      type: JwtTokenTypeEnum.ACCESS,
      userId: 'user-id',
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      authProvider: AuthProviderEnum.Password,
    }),
  };
  const twentyConfigService = {
    get: jest.fn().mockReturnValue('30d'),
  };
  const userSessionCookieService = {
    attachSessionTokenToResponse: jest.fn(),
    clearSessionCookie: jest.fn(),
    extractSessionTokenFromRequest: jest.fn(),
  };
  const service = new UserSessionService(
    userSessionRepository as never,
    {} as never,
    {} as never,
    twentyConfigService as never,
    jwtWrapperService as never,
    {} as never,
    userSessionCookieService as never,
  );
  const tokenPair = {
    accessOrWorkspaceAgnosticToken: {
      token: 'access-token',
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    refreshToken: {
      token: 'refresh-token',
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves the presented session when replacement creation fails', async () => {
    const creationError = new Error('session insert failed');

    userSessionCookieService.extractSessionTokenFromRequest.mockReturnValue(
      'presented-session-token',
    );
    userSessionRepository.save.mockRejectedValue(creationError);

    const revokeSessionByToken = jest.spyOn(service, 'revokeSessionByToken');

    await expect(
      service.issueSessionForTokenPair({
        tokenPair,
        request: { headers: {}, ip: '127.0.0.1', res: {} } as never,
        origin: 'sign_in',
      }),
    ).rejects.toBe(creationError);

    expect(revokeSessionByToken).not.toHaveBeenCalled();
    expect(
      userSessionCookieService.attachSessionTokenToResponse,
    ).not.toHaveBeenCalled();
    expect(userSessionCookieService.clearSessionCookie).not.toHaveBeenCalled();
  });

  it('fails when the required response is unavailable', async () => {
    await expect(
      service.issueSessionForTokenPair({
        tokenPair,
        request: { headers: {} } as never,
        origin: 'sign_in',
      }),
    ).rejects.toThrow('Cannot issue a user session without an HTTP response');

    expect(userSessionRepository.save).not.toHaveBeenCalled();
  });
});
