import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('ApplicationRegistrationService - upsertFromCatalog', () => {
  let service: ApplicationRegistrationService;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const catalogParams = {
    universalIdentifier: '97141c95-2870-5662-8992-44fb6536be9a',
    name: 'My App',
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: 'twenty-app-my-app',
    latestAvailableVersion: '0.2.0',
    manifest: null,
  };

  const buildExistingRegistration = (
    overrides: Partial<ApplicationRegistrationEntity>,
  ) =>
    ({
      id: 'registration-id',
      universalIdentifier: catalogParams.universalIdentifier,
      name: 'My App',
      galleryImages: [],
      ...overrides,
    }) as ApplicationRegistrationEntity;

  beforeEach(async () => {
    applicationRegistrationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((entity) => entity),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: { syncVariableSchemas: jest.fn() },
        },
        {
          provide: ApplicationRegistrationAssetUrlService,
          useValue: { resolveAssetUrls: jest.fn() },
        },
        {
          provide: ServerFileStorageService,
          useValue: { write: jest.fn(), delete: jest.fn() },
        },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((_key, fn) => fn()) },
        },
        {
          provide: CoreEntityCacheService,
          useValue: { invalidate: jest.fn() },
        },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should re-list a registration first created by a local install when the catalog serves it', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        isListed: false,
      }),
    );

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isListed: true,
        sourceType: ApplicationRegistrationSourceType.NPM,
      }),
    );
  });

  it('should preserve an operator delisting of a registry-sourced registration', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.NPM,
        isListed: false,
      }),
    );

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isListed: false }),
    );
  });

  it('should keep an already listed registration listed', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.NPM,
        isListed: true,
      }),
    );

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isListed: true }),
    );
  });

  it('should create new catalog registrations as listed', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isListed: true }),
    );
  });

  it('should not mark a regular new registration as billing-exempt', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ hasFreeLogicFunctionExecutions: false }),
    );
  });

  it.each([
    '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
    '66a504cc-0a75-410e-a43f-cdeae1db1522',
  ])(
    'should mark each billing-exempt app as free on creation',
    async (universalIdentifier) => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      await service.upsertFromCatalog({
        ...catalogParams,
        universalIdentifier,
      });

      expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ hasFreeLogicFunctionExecutions: true }),
      );
    },
  );
});
