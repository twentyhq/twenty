import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

const CLAUDE = WELL_KNOWN_OAUTH_CLIENTS.find(
  ({ client }) => client === WellKnownOAuthClient.CLAUDE,
) as (typeof WELL_KNOWN_OAUTH_CLIENTS)[number];

describe('WellKnownOAuthClientRegistrationService', () => {
  let service: WellKnownOAuthClientRegistrationService;
  let insertedValues: jest.Mock;
  let applicationRegistrationRepository: {
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let findOneByUniversalIdentifierGlobal: jest.Mock;
  let invalidate: jest.Mock;

  beforeEach(async () => {
    insertedValues = jest.fn();

    const insertQueryBuilder = {
      insert: () => insertQueryBuilder,
      into: () => insertQueryBuilder,
      values: (values: unknown) => {
        insertedValues(values);

        return insertQueryBuilder;
      },
      orIgnore: () => insertQueryBuilder,
      returning: () => insertQueryBuilder,
      execute: jest.fn().mockResolvedValue({ raw: [{ id: 'inserted-id' }] }),
    };

    applicationRegistrationRepository = {
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => insertQueryBuilder),
    };
    findOneByUniversalIdentifierGlobal = jest.fn();
    invalidate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WellKnownOAuthClientRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: ApplicationRegistrationLookupService,
          useValue: { findOneByUniversalIdentifierGlobal },
        },
        { provide: CoreEntityCacheService, useValue: { invalidate } },
      ],
    }).compile();

    service = module.get(WellKnownOAuthClientRegistrationService);
  });

  it('returns the existing registration without inserting one', async () => {
    const existingRegistration = { id: 'claude-registration-id' };

    findOneByUniversalIdentifierGlobal.mockResolvedValue(existingRegistration);

    await expect(service.findOrCreateRegistration(CLAUDE)).resolves.toBe(
      existingRegistration,
    );
    expect(insertedValues).not.toHaveBeenCalled();
  });

  it('inserts a public OAuth-only registration with the vendor callbacks', async () => {
    findOneByUniversalIdentifierGlobal
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'claude-registration-id' });

    await service.findOrCreateRegistration(CLAUDE);

    expect(insertedValues).toHaveBeenCalledWith(
      expect.objectContaining({
        universalIdentifier: CLAUDE.universalIdentifier,
        name: 'Claude',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        oAuthClientSecretHash: null,
        ownerWorkspaceId: null,
        oAuthRedirectUris: ['https://claude.ai/api/mcp/auth_callback'],
        isListed: true,
      }),
    );
    expect(invalidate).toHaveBeenCalledWith(
      'marketplaceCatalog',
      expect.any(String),
    );
  });

  it('brings the display content of an existing registration up to date', async () => {
    findOneByUniversalIdentifierGlobal.mockResolvedValue({
      id: 'claude-registration-id',
    });

    await service.syncRegistration(CLAUDE);

    expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
      'claude-registration-id',
      expect.objectContaining({
        name: 'Claude',
        description: CLAUDE.description,
        logo: CLAUDE.logo,
        isListed: true,
      }),
    );
  });
});
