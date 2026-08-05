import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not } from 'typeorm';

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

describe('ApplicationRegistrationService - unlistSupersededCatalogRegistrations', () => {
  let service: ApplicationRegistrationService;
  let applicationRegistrationRepository: {
    find: jest.Mock;
    update: jest.Mock;
  };
  let coreEntityCacheService: { invalidate: jest.Mock };

  const sourcePackage = 'twenty-app-my-app';
  const currentUniversalIdentifier = '97141c95-2870-5662-8992-44fb6536be9a';

  beforeEach(async () => {
    applicationRegistrationRepository = {
      find: jest.fn(),
      update: jest.fn(),
    };
    coreEntityCacheService = { invalidate: jest.fn() };

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
          useValue: coreEntityCacheService,
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

  it('should unlist listed npm registrations of the same package with a different universalIdentifier', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([
      { id: 'superseded-registration-id' },
    ]);

    await service.unlistSupersededCatalogRegistrations({
      sourcePackage,
      currentUniversalIdentifier,
    });

    expect(applicationRegistrationRepository.find).toHaveBeenCalledWith({
      select: ['id'],
      where: {
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage,
        universalIdentifier: Not(currentUniversalIdentifier),
        isListed: true,
      },
    });
    expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
      ['superseded-registration-id'],
      { isListed: false },
    );
    expect(coreEntityCacheService.invalidate).toHaveBeenCalled();
  });

  it('should do nothing when no superseded registration exists', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([]);

    await service.unlistSupersededCatalogRegistrations({
      sourcePackage,
      currentUniversalIdentifier,
    });

    expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
    expect(coreEntityCacheService.invalidate).not.toHaveBeenCalled();
  });
});
