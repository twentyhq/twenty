import { Test, type TestingModule } from '@nestjs/testing';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_NAME,
  WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_OPTIONS,
} from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/jobs/warm-up-application-logic-functions.job-constants';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
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

const workspaceMigrationWithCreatedLogicFunction = {
  applicationUniversalIdentifier: 'test-app',
  actions: [
    {
      type: 'create',
      metadataName: 'logicFunction',
      flatEntity: { universalIdentifier: 'created-function' },
    },
  ],
};

describe('ApplicationManifestApplyService', () => {
  let service: ApplicationManifestApplyService;

  const applicationSyncService = { synchronizeFromManifest: jest.fn() };
  const sdkClientGenerationService = {
    generateSdkClientForApplication: jest.fn(),
  };
  const applicationRegistrationService = {};
  const messageQueueService = { add: jest.fn() };

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
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: messageQueueService,
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

  it('enqueues the prebuilt warm-up job on install/upgrade after the SDK client regeneration', async () => {
    applicationSyncService.synchronizeFromManifest.mockResolvedValue({
      workspaceMigration: workspaceMigrationWithCreatedLogicFunction,
      hasSchemaMetadataChanged: false,
    });

    const callOrder: string[] = [];

    sdkClientGenerationService.generateSdkClientForApplication.mockImplementation(
      async () => {
        callOrder.push('generateSdkClient');
      },
    );
    messageQueueService.add.mockImplementation(async () => {
      callOrder.push('enqueueWarmUp');
    });

    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
      forceSdkClientGeneration: true,
    });

    expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    expect(messageQueueService.add).toHaveBeenCalledWith(
      WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_NAME,
      {
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        logicFunctionUniversalIdentifiers: ['created-function'],
      },
      WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_OPTIONS,
    );
    expect(callOrder).toEqual(['generateSdkClient', 'enqueueWarmUp']);
  });

  it('skips the prebuilt warm-up job when the migration touches no logic function bundle', async () => {
    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
      forceSdkClientGeneration: true,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('skips the prebuilt warm-up job on dev sync, including the first apply', async () => {
    applicationSyncService.synchronizeFromManifest.mockResolvedValue({
      workspaceMigration: workspaceMigrationWithCreatedLogicFunction,
      hasSchemaMetadataChanged: true,
    });

    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application,
    });
    await service.applyManifestToWorkspace({
      workspaceId: WORKSPACE_ID,
      manifest,
      application: { ...application, version: null },
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
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
