import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EntityNotFoundError, type FindOneOptions } from 'typeorm';

import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { SdkClientArchiveBuilderFactory } from 'src/engine/core-modules/sdk-client/sdk-client-archive-builder.factory';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock(
  'src/engine/core-modules/sdk-client/utils/compute-sdk-client-core-checksum-from-archive.util',
  () => ({
    computeSdkClientCoreChecksumFromArchive: jest
      .fn()
      .mockResolvedValue('checksum'),
  }),
);

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const APPLICATION_ID = '20202020-0000-4000-8000-000000000002';

const softDeletedWorkspace = {
  id: WORKSPACE_ID,
  databaseSchema: 'workspace_schema',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-11-20T00:00:00.000Z'),
  deletedAt: new Date('2026-11-20T00:00:00.000Z'),
} as WorkspaceEntity;

// Mirrors TypeORM: soft-deleted rows are only returned with withDeleted
const findOneOrFail = jest.fn(
  async (options: FindOneOptions<WorkspaceEntity>) => {
    if (options.withDeleted === true) {
      return softDeletedWorkspace;
    }

    throw new EntityNotFoundError(WorkspaceEntity, options.where);
  },
);

describe('SdkClientGenerationService', () => {
  let service: SdkClientGenerationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SdkClientGenerationService,
        { provide: FileStorageService, useValue: { writeFile: jest.fn() } },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOneOrFail },
        },
        {
          provide: WorkspaceGraphqlSchemaSDLService,
          useValue: {
            getOrComputeSchemaSDL: jest.fn().mockResolvedValue(null),
          },
        },
        { provide: ApplicationService, useValue: { update: jest.fn() } },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: { add: jest.fn() },
        },
        {
          provide: MetricsService,
          useValue: {
            incrementCounterBy: jest.fn(),
            recordHistogram: jest.fn(),
          },
        },
        {
          provide: SdkClientArchiveBuilderFactory,
          useValue: {
            getCurrentDriver: () => ({
              buildArchive: jest.fn().mockResolvedValue(Buffer.from('sdk')),
            }),
          },
        },
      ],
    }).compile();

    service = module.get(SdkClientGenerationService);
  });

  it('generates the SDK client of a soft-deleted workspace so its uninstall hooks can run', async () => {
    const archiveBuffer = await service.generateSdkClientForApplication({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier: APPLICATION_ID,
    });

    expect(archiveBuffer.toString()).toBe('sdk');
  });
});
