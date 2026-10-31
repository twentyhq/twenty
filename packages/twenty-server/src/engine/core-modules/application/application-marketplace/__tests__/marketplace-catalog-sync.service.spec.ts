import { Test, type TestingModule } from '@nestjs/testing';

import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';

describe('MarketplaceCatalogSyncService - well-known OAuth clients', () => {
  let service: MarketplaceCatalogSyncService;
  let fetchAppsFromRegistry: jest.Mock;
  let syncRegistration: jest.Mock;
  let storeRegistrationAssets: jest.Mock;
  let invalidateMarketplaceCatalog: jest.Mock;

  beforeEach(async () => {
    fetchAppsFromRegistry = jest.fn().mockResolvedValue([]);
    syncRegistration = jest.fn(async ({ universalIdentifier }) => ({
      registration: {
        id: `${universalIdentifier}-registration`,
        logoFileId: null,
        galleryImages: [],
      },
      hasChanged: false,
    }));
    storeRegistrationAssets = jest.fn();
    invalidateMarketplaceCatalog = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceCatalogSyncService,
        { provide: ApplicationRegistrationService, useValue: {} },
        {
          provide: ApplicationRegistrationSeedingService,
          useValue: { invalidateMarketplaceCatalog },
        },
        { provide: ApplicationRegistrationLookupService, useValue: {} },
        {
          provide: ApplicationRegistrationAssetService,
          useValue: { storeRegistrationAssets },
        },
        { provide: ApplicationRegistrationVersionService, useValue: {} },
        { provide: MarketplaceService, useValue: { fetchAppsFromRegistry } },
        { provide: ApplicationPackageFetcherService, useValue: {} },
        {
          provide: WellKnownOAuthClientRegistrationService,
          useValue: { syncRegistration },
        },
      ],
    }).compile();

    service = module.get(MarketplaceCatalogSyncService);
  });

  it('seeds every well-known client with its bundled logo', async () => {
    await service.syncCatalog();

    for (const wellKnownOAuthClient of WELL_KNOWN_OAUTH_CLIENTS) {
      expect(syncRegistration).toHaveBeenCalledWith(wellKnownOAuthClient);
      expect(storeRegistrationAssets).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationRegistrationId: `${wellKnownOAuthClient.universalIdentifier}-registration`,
          manifestApplication: { logo: wellKnownOAuthClient.logo },
        }),
      );
    }
    expect(invalidateMarketplaceCatalog).toHaveBeenCalled();
  });

  it('leaves the cached catalog alone when the seeded registrations are up to date', async () => {
    syncRegistration.mockImplementation(async ({ universalIdentifier }) => ({
      registration: {
        id: `${universalIdentifier}-registration`,
        logoFileId: 'stored-logo-file-id',
        galleryImages: [],
      },
      hasChanged: false,
    }));

    await service.syncCatalog();

    expect(storeRegistrationAssets).not.toHaveBeenCalled();
    expect(invalidateMarketplaceCatalog).not.toHaveBeenCalled();
  });

  it('reads the logos shipped with the server', async () => {
    await service.syncCatalog();

    const { readAsset } = storeRegistrationAssets.mock.calls[0][0];

    await expect(readAsset(WELL_KNOWN_OAUTH_CLIENTS[0].logo)).resolves.toEqual(
      expect.any(Buffer),
    );
  });

  it('seeds them before reaching the registry, which may be unreachable', async () => {
    fetchAppsFromRegistry.mockRejectedValue(new Error('registry unreachable'));

    await expect(service.syncCatalog()).rejects.toThrow('registry unreachable');
    expect(syncRegistration).toHaveBeenCalledTimes(
      WELL_KNOWN_OAUTH_CLIENTS.length,
    );
  });
});
