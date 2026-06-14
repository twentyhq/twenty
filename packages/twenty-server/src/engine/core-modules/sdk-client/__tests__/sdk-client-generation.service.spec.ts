import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GENERATE_SDK_CLIENT_JOB_NAME } from 'src/engine/core-modules/sdk-client/jobs/generate-sdk-client.job-constants';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('SdkClientGenerationService', () => {
  let service: SdkClientGenerationService;
  let applicationService: jest.Mocked<
    Pick<
      ApplicationService,
      'findWorkspaceTwentyStandardAndCustomApplicationOrThrow'
    >
  >;
  let messageQueueService: jest.Mocked<Pick<MessageQueueService, 'add'>>;

  beforeEach(async () => {
    applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
    };
    messageQueueService = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SdkClientGenerationService,
        { provide: FileStorageService, useValue: {} },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {} as Repository<ApplicationEntity>,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {} as Repository<WorkspaceEntity>,
        },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: WorkspaceSchemaFactory, useValue: {} },
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: messageQueueService,
        },
      ],
    }).compile();

    service = module.get<SdkClientGenerationService>(
      SdkClientGenerationService,
    );
  });

  describe('enqueueSdkClientGenerationForWorkspace', () => {
    const workspaceId = 'workspace-1';
    const apps = {
      twentyStandardFlatApplication: {
        id: 'std-app-id',
        universalIdentifier: 'twenty-standard',
      },
      workspaceCustomFlatApplication: {
        id: 'custom-app-id',
        universalIdentifier: 'workspace-custom',
      },
    };

    it('enqueues one job per application with dedup id and retry limit', async () => {
      applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow.mockResolvedValue(
        apps as never,
      );

      await service.enqueueSdkClientGenerationForWorkspace(workspaceId);

      expect(messageQueueService.add).toHaveBeenCalledTimes(2);
      expect(messageQueueService.add).toHaveBeenNthCalledWith(
        1,
        GENERATE_SDK_CLIENT_JOB_NAME,
        {
          workspaceId,
          applicationId: 'std-app-id',
          applicationUniversalIdentifier: 'twenty-standard',
        },
        {
          id: `sdk-client:${workspaceId}:std-app-id`,
          retryLimit: 3,
        },
      );
      expect(messageQueueService.add).toHaveBeenNthCalledWith(
        2,
        GENERATE_SDK_CLIENT_JOB_NAME,
        {
          workspaceId,
          applicationId: 'custom-app-id',
          applicationUniversalIdentifier: 'workspace-custom',
        },
        {
          id: `sdk-client:${workspaceId}:custom-app-id`,
          retryLimit: 3,
        },
      );
    });

    it('propagates errors thrown by the message queue service', async () => {
      applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow.mockResolvedValue(
        apps as never,
      );
      const failure = new Error('Redis unavailable');

      messageQueueService.add.mockRejectedValueOnce(failure);

      await expect(
        service.enqueueSdkClientGenerationForWorkspace(workspaceId),
      ).rejects.toBe(failure);
    });
  });
});
