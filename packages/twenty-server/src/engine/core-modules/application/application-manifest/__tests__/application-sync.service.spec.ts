import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'app-universal-id';

describe('ApplicationSyncService - runtime resource cleanup', () => {
  let service: ApplicationSyncService;
  let deleteApplicationResources: jest.Mock;

  beforeEach(async () => {
    deleteApplicationResources = jest.fn().mockResolvedValue(undefined);

    const driver = {
      deleteApplicationResources,
    } as unknown as LogicFunctionDriver;

    const driverFactory = {
      getCurrentDriver: jest.fn().mockReturnValue(driver),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSyncService,
        { provide: ApplicationService, useValue: {} },
        { provide: ApplicationManifestMigrationService, useValue: {} },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {},
        },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: FileStorageService, useValue: {} },
        {
          provide: LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN,
          useValue: driverFactory,
        },
        { provide: LogicFunctionDriverFactory, useValue: driverFactory },
      ],
    }).compile();

    service = module.get<ApplicationSyncService>(ApplicationSyncService);
  });

  const callCleanup = () =>
    (
      service as unknown as {
        cleanupApplicationRuntimeResources: (params: {
          workspaceId: string;
          applicationUniversalIdentifier: string;
        }) => Promise<void>;
      }
    ).cleanupApplicationRuntimeResources({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

  it('should delete app-scoped runtime resources via the driver', async () => {
    await callCleanup();

    expect(deleteApplicationResources).toHaveBeenCalledTimes(1);
    expect(deleteApplicationResources).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should swallow cleanup failures so uninstall is never wedged', async () => {
    deleteApplicationResources.mockRejectedValueOnce(new Error('aws down'));

    await expect(callCleanup()).resolves.toBeUndefined();
  });
});
