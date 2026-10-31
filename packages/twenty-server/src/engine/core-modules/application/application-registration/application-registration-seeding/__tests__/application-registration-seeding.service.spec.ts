import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const SEEDED_VALUES = {
  universalIdentifier: '20202020-82da-4d5a-afd2-53c52090f5e1',
  name: 'Twenty CLI',
  oAuthRedirectUris: [],
  oAuthScopes: ['api', 'profile'],
};

describe('ApplicationRegistrationSeedingService', () => {
  let service: ApplicationRegistrationSeedingService;
  let insertedValues: jest.Mock;
  let insertResult: { raw: { id: string }[] };
  let findOneByUniversalIdentifierGlobal: jest.Mock;
  let invalidate: jest.Mock;

  beforeEach(async () => {
    insertedValues = jest.fn();
    insertResult = { raw: [{ id: 'inserted-id' }] };

    const insertQueryBuilder = {
      insert: () => insertQueryBuilder,
      into: () => insertQueryBuilder,
      values: (values: unknown) => {
        insertedValues(values);

        return insertQueryBuilder;
      },
      orIgnore: () => insertQueryBuilder,
      returning: () => insertQueryBuilder,
      execute: jest.fn(async () => insertResult),
    };

    findOneByUniversalIdentifierGlobal = jest.fn();
    invalidate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationSeedingService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: { createQueryBuilder: jest.fn(() => insertQueryBuilder) },
        },
        {
          provide: ApplicationRegistrationLookupService,
          useValue: { findOneByUniversalIdentifierGlobal },
        },
        { provide: CoreEntityCacheService, useValue: { invalidate } },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationSeedingService);
  });

  it('returns the existing registration without inserting one', async () => {
    const existingRegistration = {
      id: 'existing-id',
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      ownerWorkspaceId: null,
      oAuthClientSecretHash: null,
    };

    findOneByUniversalIdentifierGlobal.mockResolvedValue(existingRegistration);

    await expect(
      service.findOrCreateOAuthOnlyRegistration(SEEDED_VALUES),
    ).resolves.toBe(existingRegistration);
    expect(insertedValues).not.toHaveBeenCalled();
  });

  it('refuses a row someone else created under the reserved identifier', async () => {
    findOneByUniversalIdentifierGlobal.mockResolvedValue({
      id: 'squatted-id',
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      ownerWorkspaceId: 'attacker-workspace-id',
      oAuthClientSecretHash: 'hash',
    });

    await expect(
      service.findOrCreateOAuthOnlyRegistration(SEEDED_VALUES),
    ).rejects.toThrow('taken by another owner');
  });

  it('inserts a public OAuth-only registration and refreshes the marketplace catalog', async () => {
    findOneByUniversalIdentifierGlobal
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'inserted-id' });

    await service.findOrCreateOAuthOnlyRegistration(SEEDED_VALUES);

    expect(insertedValues).toHaveBeenCalledWith(
      expect.objectContaining({
        ...SEEDED_VALUES,
        oAuthClientSecretHash: null,
        ownerWorkspaceId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    );
    expect(invalidate).toHaveBeenCalledWith(
      'marketplaceCatalog',
      expect.any(String),
    );
  });

  it('leaves the catalog alone when a concurrent request inserted the row first', async () => {
    insertResult = { raw: [] };
    findOneByUniversalIdentifierGlobal
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'concurrent-id' });

    await expect(
      service.findOrCreateOAuthOnlyRegistration(SEEDED_VALUES),
    ).resolves.toEqual({ id: 'concurrent-id' });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('does not fail a request when the catalog cache cannot be invalidated', async () => {
    invalidate.mockRejectedValue(new Error('Redis down'));

    await expect(service.invalidateMarketplaceCatalog()).resolves.toBe(
      undefined,
    );
  });
});
