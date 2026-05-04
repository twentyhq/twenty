jest.mock(
  'src/engine/core-modules/secret-encryption/secret-encryption.service',
  () => ({
    SecretEncryptionService: class {},
  }),
);

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ConnectionProviderManifest } from 'twenty-shared/application';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const APP_ID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const WORKSPACE_ID = 'b8b8b8b8-b8b8-4b8b-b8b8-b8b8b8b8b8b8';

const buildOAuthManifest = (
  overrides: Partial<ConnectionProviderManifest> = {},
): ConnectionProviderManifest =>
  ({
    universalIdentifier: '99fcd8e8-fbb1-4d2c-bc16-7c61ef3eaaaa',
    name: 'linear',
    displayName: 'Linear',
    type: 'oauth',
    oauth: {
      authorizationEndpoint: 'https://linear.app/oauth/authorize',
      tokenEndpoint: 'https://api.linear.app/oauth/token',
      scopes: ['read', 'write'],
      clientIdVariable: 'LINEAR_CLIENT_ID',
      clientSecretVariable: 'LINEAR_CLIENT_SECRET',
    },
    ...overrides,
  }) as ConnectionProviderManifest;

describe('ApplicationOAuthProviderService', () => {
  let service: ApplicationOAuthProviderService;
  let oauthProviderRepository: {
    find: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    oauthProviderRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOAuthProviderService,
        {
          provide: getRepositoryToken(ApplicationOAuthProviderEntity),
          useValue: oauthProviderRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { findOneBy: jest.fn() },
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: { find: jest.fn() },
        },
        { provide: SecretEncryptionService, useValue: {} },
      ],
    }).compile();

    service = module.get(ApplicationOAuthProviderService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('upsertManyFromManifest', () => {
    it('rejects a manifest whose connection provider has a non-UUID universalIdentifier', async () => {
      const manifestWithBadId = buildOAuthManifest({
        universalIdentifier: 'linear-provider',
      });

      const error = await service
        .upsertManyFromManifest({
          connectionProviders: [manifestWithBadId],
          applicationId: APP_ID,
          workspaceId: WORKSPACE_ID,
        })
        .catch((caught) => caught);

      expect(error).toBeInstanceOf(ApplicationOAuthProviderException);
      expect(error.code).toBe(
        ApplicationOAuthProviderExceptionCode.INVALID_REQUEST,
      );
      expect(error.message).toContain('linear');
      expect(error.message).toContain('linear-provider');
      // Crucially: the failing validation must run before any DB write.
      expect(oauthProviderRepository.save).not.toHaveBeenCalled();
      expect(oauthProviderRepository.delete).not.toHaveBeenCalled();
    });

    it('points at the first invalid provider when multiple are wrong', async () => {
      const error = await service
        .upsertManyFromManifest({
          connectionProviders: [
            buildOAuthManifest({
              name: 'first-bad',
              universalIdentifier: 'not-a-uuid',
            }),
            buildOAuthManifest({
              name: 'second-bad',
              universalIdentifier: 'also-bad',
            }),
          ],
          applicationId: APP_ID,
          workspaceId: WORKSPACE_ID,
        })
        .catch((caught) => caught);

      expect(error.message).toContain('first-bad');
    });

    it('accepts a valid UUID and persists the provider', async () => {
      await service.upsertManyFromManifest({
        connectionProviders: [buildOAuthManifest()],
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(oauthProviderRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({
          universalIdentifier: '99fcd8e8-fbb1-4d2c-bc16-7c61ef3eaaaa',
          name: 'linear',
        }),
      ]);
    });
  });
});
