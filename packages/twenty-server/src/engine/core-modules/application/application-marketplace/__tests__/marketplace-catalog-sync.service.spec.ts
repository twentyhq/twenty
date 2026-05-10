import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceCatalogSyncService } from '../marketplace-catalog-sync.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('MarketplaceCatalogSyncService', () => {
  let service: MarketplaceCatalogSyncService;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;
  let marketplaceService: jest.Mocked<MarketplaceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceCatalogSyncService,
        {
          provide: ApplicationRegistrationService,
          useValue: {
            upsertFromCatalog: jest.fn(),
            unlistOrphanedRegistrations: jest.fn(),
          },
        },
        {
          provide: MarketplaceService,
          useValue: {
            fetchAppsFromRegistry: jest.fn(),
            fetchManifestFromRegistryCdn: jest.fn(),
            fetchReadmeFromRegistryCdn: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://cdn.example.com'),
          },
        },
      ],
    }).compile();

    service = module.get<MarketplaceCatalogSyncService>(
      MarketplaceCatalogSyncService,
    );
    applicationRegistrationService = module.get(ApplicationRegistrationService);
    marketplaceService = module.get(MarketplaceService);
  });

  it('should sync apps and unlist orphaned registrations', async () => {
    const mockPackages = [
      { name: 'pkg1', version: '1.0.0' },
      { name: 'pkg2', version: '2.0.0' },
    ];

    marketplaceService.fetchAppsFromRegistry.mockResolvedValue(
      mockPackages as any,
    );
    marketplaceService.fetchManifestFromRegistryCdn.mockImplementation(
      async (name) =>
        ({
          application: {
            universalIdentifier: `uuid-${name}`,
            displayName: `Display ${name}`,
          },
        }) as any,
    );

    await service.syncCatalog();

    expect(
      applicationRegistrationService.upsertFromCatalog,
    ).toHaveBeenCalledTimes(2);
    expect(
      applicationRegistrationService.unlistOrphanedRegistrations,
    ).toHaveBeenCalledWith(['uuid-pkg1', 'uuid-pkg2']);
  });

  it('should handle partial failures and skip unlisting', async () => {
    const mockPackages = [
      { name: 'pkg1', version: '1.0.0' },
      { name: 'pkg2', version: '2.0.0' },
    ];

    marketplaceService.fetchAppsFromRegistry.mockResolvedValue(
      mockPackages as any,
    );
    marketplaceService.fetchManifestFromRegistryCdn.mockImplementation(
      async (name) => {
        if (name === 'pkg1') {
          return {
            application: {
              universalIdentifier: 'uuid-pkg1',
            },
          } as any;
        }
        throw new Error('Failed to fetch manifest');
      },
    );

    await service.syncCatalog();

    expect(
      applicationRegistrationService.upsertFromCatalog,
    ).toHaveBeenCalledTimes(1);
    expect(
      applicationRegistrationService.unlistOrphanedRegistrations,
    ).not.toHaveBeenCalled();
  });
});
