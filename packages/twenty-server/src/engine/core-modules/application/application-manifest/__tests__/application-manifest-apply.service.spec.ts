import { Test, type TestingModule } from '@nestjs/testing';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000002';

const application = {
  id: APPLICATION_ID,
  universalIdentifier: 'test-app',
  version: '1.2.3',
};

const manifest = {
  application: { universalIdentifier: 'test-app' },
} as Manifest;

describe('ApplicationManifestApplyService', () => {
  let service: ApplicationManifestApplyService;

  const applicationSyncService = { synchronizeFromManifest: jest.fn() };
  const sdkClientGenerationService = {
    generateSdkClientForApplication: jest.fn(),
  };
  const applicationRegistrationService = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    applicationSyncService.synchronizeFromManifest.mockResolvedValue({
      workspaceMigration: { actions: [] },
      hasSchemaMetadataChanged: false,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationManifestApplyService,
        { provide: ApplicationSyncService, useValue: applicationSyncService },
        {
          provide: SdkClientGenerationService,
          useValue: sdkClientGenerationService,
        },
        {
          provide: ApplicationRegistrationService,
          useValue: applicationRegistrationService,
        },
      ],
    }).compile();

    service = module.get(ApplicationManifestApplyService);
  });

  it('regenerates the SDK client on install/upgrade even without schema changes', async () => {
    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
      forceSdkClientGeneration: true,
    });

    expect(
      sdkClientGenerationService.generateSdkClientForApplication,
    ).toHaveBeenCalledTimes(1);
    expect(
      sdkClientGenerationService.generateSdkClientForApplication,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier: 'test-app',
      trigger: 'manifest-sync',
    });
  });

  it('skips SDK client generation on dev sync when the schema is unchanged', async () => {
    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
    });

    expect(
      sdkClientGenerationService.generateSdkClientForApplication,
    ).not.toHaveBeenCalled();
  });

  it('regenerates the SDK client on dev sync when the schema changed', async () => {
    applicationSyncService.synchronizeFromManifest.mockResolvedValue({
      workspaceMigration: { actions: [] },
      hasSchemaMetadataChanged: true,
    });

    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
    });

    expect(
      sdkClientGenerationService.generateSdkClientForApplication,
    ).toHaveBeenCalledTimes(1);
  });

  it('regenerates the SDK client on dev sync first apply even without schema changes', async () => {
    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application: { ...application, version: null },
    });

    expect(
      sdkClientGenerationService.generateSdkClientForApplication,
    ).toHaveBeenCalledTimes(1);
  });
});
