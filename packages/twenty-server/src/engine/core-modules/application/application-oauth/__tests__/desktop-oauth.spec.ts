import { createHash } from 'crypto';

import { OAuthService } from 'src/engine/core-modules/application/application-oauth/oauth.service';
import {
  DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER,
  getDesktopRecorderOAuthFields,
} from 'src/engine/core-modules/application/application-oauth/constants/desktop-recorder-oauth.constant';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

type Dependencies = ConstructorParameters<typeof OAuthService>;

describe('Desktop Recorder sign-in', () => {
  const registration = {
    id: 'registration',
    universalIdentifier: DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER,
    oAuthScopes: ['api', 'profile'],
  };
  const codeVerifier = 'test-verifier';
  const redirectUri = 'http://127.0.0.1:12345/callback';
  const installApplication = jest.fn();
  const create = jest.fn();
  const findApplication = jest.fn();
  const recordAuthorization = jest.fn();
  const generateApplicationTokenPair = jest.fn();
  let service: OAuthService;
  let userId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    userId = 'alice';
    generateApplicationTokenPair.mockResolvedValue({
      applicationAccessToken: { token: 'access' },
      applicationRefreshToken: { token: 'refresh' },
    });
    service = new OAuthService(
      {
        findOne: async () => ({
          id: 'code',
          expiresAt: new Date(Date.now() + 60000),
          userId,
          workspaceId: 'workspace',
          context: {
            clientId: 'client',
            redirectUri,
            codeChallenge: createHash('sha256')
              .update(codeVerifier)
              .digest('base64url'),
          },
        }),
        update: jest.fn(),
      } as unknown as Dependencies[0],
      { findOne: findApplication } as unknown as Dependencies[1],
      {
        findOne: async () => ({ id: `${userId}-workspace` }),
      } as unknown as Dependencies[2],
      { generateApplicationTokenPair } as unknown as Dependencies[3],
      { recordAuthorization } as unknown as Dependencies[4],
      {
        findOneByClientId: async () => registration,
      } as unknown as Dependencies[5],
      { create } as unknown as Dependencies[6],
      { installApplication } as unknown as Dependencies[7],
      { get: () => '1h' } as unknown as Dependencies[8],
    );
  });

  const signIn = () =>
    service.exchangeAuthorizationCode({
      authorizationCode: 'code',
      clientId: 'client',
      redirectUri,
      codeVerifier,
    });

  it.each([null, ApplicationState.INSTALLING, ApplicationState.UNINSTALLING])(
    'rejects unavailable installations (%s) without installing or creating an empty app',
    async (state) => {
      findApplication.mockResolvedValue(state ? { id: 'app', state } : null);
      expect(await signIn()).toMatchObject({
        error: 'application_not_installed',
      });
      expect(installApplication).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(generateApplicationTokenPair).not.toHaveBeenCalled();
    },
  );

  it('authorizes two users on the same installed app with separate user identities', async () => {
    findApplication.mockResolvedValue({
      id: 'app',
      state: ApplicationState.INSTALLED,
    });
    for (const name of ['alice', 'bob']) {
      userId = name;
      expect(await signIn()).toMatchObject({ access_token: 'access' });
      expect(recordAuthorization).toHaveBeenLastCalledWith({
        userId: name,
        userWorkspaceId: `${name}-workspace`,
        workspaceId: 'workspace',
        applicationId: 'app',
        scopes: ['api', 'profile'],
      });
      expect(generateApplicationTokenPair).toHaveBeenLastCalledWith({
        userId: name,
        userWorkspaceId: `${name}-workspace`,
        workspaceId: 'workspace',
        applicationId: 'app',
      });
    }
    expect(installApplication).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('requires PKCE for the desktop public client', async () => {
    expect(
      await service.exchangeAuthorizationCode({
        authorizationCode: 'code',
        clientId: 'client',
        redirectUri,
      }),
    ).toMatchObject({ error: 'invalid_request' });
    expect(generateApplicationTokenPair).not.toHaveBeenCalled();
  });

  it('accepts a packaged installation on an older instance without lifecycle state', async () => {
    findApplication.mockResolvedValue({ id: 'app', sourcePath: 'tarball' });
    expect(await signIn()).toMatchObject({ access_token: 'access' });
  });

  it('rejects a legacy OAuth-only entry even if marked installed', async () => {
    findApplication.mockResolvedValue({
      id: 'app',
      sourcePath: 'oauth-install',
      state: ApplicationState.INSTALLED,
    });
    expect(await signIn()).toMatchObject({
      error: 'application_not_installed',
    });
    expect(generateApplicationTokenPair).not.toHaveBeenCalled();
  });

  it('only configures the canonical desktop registration as a public client', () => {
    expect(
      getDesktopRecorderOAuthFields(DESKTOP_RECORDER_UNIVERSAL_IDENTIFIER),
    ).toEqual({
      oAuthClientSecretHash: null,
      oAuthRedirectUris: [],
      oAuthScopes: ['api', 'profile'],
    });
    expect(getDesktopRecorderOAuthFields('other-app')).toEqual({});
  });
});
