import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import crypto from 'crypto';

import { base64UrlEncode } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { OAuthClientRegistrationResolverService } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/oauth-client-registration-resolver.service';
import { OAuthService } from 'src/engine/core-modules/application/application-oauth/oauth.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('OAuthService', () => {
  const CLIENT_ID = 'claude-client-id';
  const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
  const CODE_VERIFIER = 'code-verifier';

  let service: OAuthService;
  let findInstalledApplication: jest.Mock;
  let createApplication: jest.Mock;

  const exchangeFirstConnectionCode = () =>
    service.exchangeAuthorizationCode({
      authorizationCode: 'authorization-code',
      clientId: CLIENT_ID,
      codeVerifier: CODE_VERIFIER,
      redirectUri: REDIRECT_URI,
    });

  beforeEach(async () => {
    findInstalledApplication = jest.fn().mockResolvedValue(null);
    createApplication = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 'authorization-code-id',
              revokedAt: null,
              expiresAt: new Date(Date.now() + 60_000),
              userId: 'user-id',
              workspaceId: 'workspace-id',
              context: {
                clientId: CLIENT_ID,
                redirectUri: REDIRECT_URI,
                codeChallenge: base64UrlEncode(
                  crypto.createHash('sha256').update(CODE_VERIFIER).digest(),
                ),
              },
            }),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationEntity),
          useValue: { findOne: findInstalledApplication },
        },
        { provide: getRepositoryToken(ApplicationEntity), useValue: {} },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 'user-workspace-id' }),
          },
        },
        {
          provide: ApplicationTokenService,
          useValue: {
            generateApplicationTokenPair: jest.fn().mockResolvedValue({
              applicationAccessToken: { token: 'access-token' },
              applicationRefreshToken: { token: 'refresh-token' },
            }),
          },
        },
        {
          provide: ApplicationAuthorizationService,
          useValue: { recordAuthorization: jest.fn() },
        },
        { provide: ApplicationRegistrationService, useValue: {} },
        {
          provide: OAuthClientRegistrationResolverService,
          useValue: {
            findByClientId: jest.fn().mockResolvedValue({
              id: 'registration-id',
              name: 'Claude',
              universalIdentifier: 'claude-universal-identifier',
              oAuthClientSecretHash: null,
              oAuthScopes: ['api'],
            }),
          },
        },
        {
          provide: ApplicationService,
          useValue: { create: createApplication },
        },
        {
          provide: ApplicationInstallService,
          useValue: {
            installApplication: jest
              .fn()
              .mockRejectedValue(new Error('No published version')),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('30m') },
        },
      ],
    }).compile();

    service = module.get(OAuthService);
  });

  it('reuses the install a concurrent first connection created', async () => {
    createApplication.mockRejectedValue(
      Object.assign(new QueryFailedError('INSERT', [], new Error()), {
        code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
      }),
    );
    findInstalledApplication
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'concurrent-application-id' });

    await expect(exchangeFirstConnectionCode()).resolves.toMatchObject({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });

  it('surfaces any other failure to create the install', async () => {
    const creationError = new Error('Database unavailable');

    createApplication.mockRejectedValue(creationError);
    findInstalledApplication
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'unrelated-application-id' });

    await expect(exchangeFirstConnectionCode()).rejects.toBe(creationError);
  });
});
