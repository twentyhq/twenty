import { Test, type TestingModule } from '@nestjs/testing';

import { type AgentTrigger } from 'twenty-shared/application';
import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldActorSource,
  FieldMetadataType,
  MetadataReadability,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { CallAgentDatabaseEventTriggersJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/call-agent-database-event-triggers.job';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_METADATA_ID = 'company-object-id';
const NAME_FIELD_ID = 'name-field-id';
const CITY_FIELD_ID = 'city-field-id';
const APPLICATION_ID = 'application-id';
const AGENT_ID = 'agent-id';
const AGENT_ROLE_ID = 'agent-role-id';
const TRIGGER_ID = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';

const buildMaps = (
  entities: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[],
) =>
  entities.reduce(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity as never,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const flatFieldMetadataMaps = buildMaps([
  getFlatFieldMetadataMock({
    id: NAME_FIELD_ID,
    universalIdentifier: NAME_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
  }),
  getFlatFieldMetadataMock({
    id: CITY_FIELD_ID,
    universalIdentifier: CITY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'city',
  }),
]);

const buildTrigger = (
  settings: Partial<
    Extract<AgentTrigger, { type: 'DATABASE_EVENT' }>['settings']
  > = {},
  isActive = true,
): AgentTrigger => ({
  id: TRIGGER_ID,
  type: 'DATABASE_EVENT',
  isActive,
  instructions: 'Check the company',
  settings: { eventName: 'company.updated', ...settings },
});

const buildFlatAgentMaps = (triggers: AgentTrigger[]) =>
  buildMaps([
    {
      id: AGENT_ID,
      universalIdentifier: AGENT_ID,
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      triggers,
      deletedAt: null,
    },
  ]);

const buildEvent = (
  recordId: string,
  {
    updatedFields = ['name'],
    updatedBy,
  }: { updatedFields?: string[]; updatedBy?: object } = {},
): ObjectRecordUpdateEvent =>
  ({
    recordId,
    properties: {
      updatedFields,
      before: { id: recordId, name: 'Old' },
      after: { id: recordId, name: 'New', updatedBy },
      diff: { name: { before: 'Old', after: 'New' } },
    },
  }) as unknown as ObjectRecordUpdateEvent;

const buildRolesPermissions = (
  canReadObjectRecords = true,
): ObjectsPermissionsByRoleId => ({
  [AGENT_ROLE_ID]: {
    [OBJECT_METADATA_ID]: {
      canReadObjectRecords,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
  },
});

describe('CallAgentDatabaseEventTriggersJob', () => {
  let job: CallAgentDatabaseEventTriggersJob;
  let messageQueueService: { bulkAdd: jest.Mock };
  let agentTriggerThrottlerService: { consumeAvailableRuns: jest.Mock };
  let cacheData: Record<string, unknown>;

  const buildBatch = (
    events: ObjectRecordUpdateEvent[],
  ): WorkspaceEventBatch<ObjectRecordUpdateEvent> => ({
    name: 'company.updated',
    workspaceId: WORKSPACE_ID,
    objectMetadata: getFlatObjectMetadataMock({
      id: OBJECT_METADATA_ID,
      universalIdentifier: OBJECT_METADATA_ID,
      nameSingular: 'company',
      namePlural: 'companies',
      applicationId: 'other-application-id',
      readability: MetadataReadability.OPEN,
      fieldIds: [NAME_FIELD_ID, CITY_FIELD_ID],
      fieldUniversalIdentifiers: [NAME_FIELD_ID, CITY_FIELD_ID],
    }),
    events,
  });

  const enqueuedJobs = (): RunAgentTriggerJobData[] =>
    messageQueueService.bulkAdd.mock.calls.flatMap(([, jobs]) =>
      (jobs as { data: RunAgentTriggerJobData }[]).map(
        (enqueuedJob) => enqueuedJob.data,
      ),
    );

  beforeEach(async () => {
    cacheData = {
      featureFlagsMap: {},
      flatAgentMaps: buildFlatAgentMaps([buildTrigger()]),
      flatRoleTargetByAgentIdMaps: {
        [AGENT_ID]: { agentId: AGENT_ID, roleId: AGENT_ROLE_ID },
      },
      rolesPermissions: buildRolesPermissions(),
      roleIdsWithAllRecordsAccess: [],
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      flatFieldMetadataMaps,
      flatFieldMetadataMapsOrm: flatFieldMetadataMaps,
    };

    messageQueueService = { bulkAdd: jest.fn().mockResolvedValue(undefined) };
    agentTriggerThrottlerService = {
      consumeAvailableRuns: jest
        .fn()
        .mockImplementation(
          async ({ requestedRunCount }: { requestedRunCount: number }) =>
            requestedRunCount,
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallAgentDatabaseEventTriggersJob,
        RecordAccessPolicyService,
        {
          provide: getQueueToken(MessageQueue.aiQueue),
          useValue: messageQueueService,
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockImplementation(async () => ({
              flatObjectMetadataMaps: { byUniversalIdentifier: {} },
              ...cacheData,
            })),
          },
        },
        {
          provide: AgentTriggerThrottlerService,
          useValue: agentTriggerThrottlerService,
        },
        {
          provide: RecordShareStorageService,
          useValue: { findByRecordIds: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: WorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn(),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((fn: () => unknown) => fn()),
          },
        },
      ],
    }).compile();

    job = module.get(CallAgentDatabaseEventTriggersJob);
  });

  it('should enqueue one run per event the agent role can read', async () => {
    await job.handle(
      buildBatch([buildEvent('record-1'), buildEvent('record-2')]),
    );

    expect(messageQueueService.bulkAdd).toHaveBeenCalledWith(
      RunAgentTriggerJob.name,
      expect.any(Array),
    );
    expect(enqueuedJobs()).toEqual([
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        agentId: AGENT_ID,
        triggerId: TRIGGER_ID,
        dispatchedRoleId: AGENT_ROLE_ID,
        payload: expect.objectContaining({
          type: 'DATABASE_EVENT',
          eventName: 'company.updated',
          objectNameSingular: 'company',
          events: [expect.objectContaining({ recordId: 'record-1' })],
        }),
      }),
      expect.objectContaining({
        payload: expect.objectContaining({
          events: [expect.objectContaining({ recordId: 'record-2' })],
        }),
      }),
    ]);
  });

  it('should group events into one run in batch mode', async () => {
    cacheData.flatAgentMaps = buildFlatAgentMaps([
      buildTrigger({ batchMode: true }),
    ]);

    await job.handle(
      buildBatch([buildEvent('record-1'), buildEvent('record-2')]),
    );

    expect(enqueuedJobs()).toHaveLength(1);
    expect(enqueuedJobs()[0].payload).toMatchObject({
      events: [{ recordId: 'record-1' }, { recordId: 'record-2' }],
    });
  });

  it('should not enqueue anything for an agent without a role', async () => {
    cacheData.flatRoleTargetByAgentIdMaps = {};

    await job.handle(buildBatch([buildEvent('record-1')]));

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should not enqueue events of an object the agent role cannot read', async () => {
    cacheData.rolesPermissions = buildRolesPermissions(false);

    await job.handle(buildBatch([buildEvent('record-1')]));

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should skip updates the agent made itself', async () => {
    await job.handle(
      buildBatch([
        buildEvent('record-1', {
          updatedBy: {
            source: FieldActorSource.AGENT,
            workspaceMemberId: null,
            name: 'Enricher',
            context: { agentId: AGENT_ID },
          },
        }),
        buildEvent('record-2'),
      ]),
    );

    expect(enqueuedJobs()).toHaveLength(1);
    expect(enqueuedJobs()[0].payload).toMatchObject({
      events: [{ recordId: 'record-2' }],
    });
  });

  it('should only run on updates touching a watched field', async () => {
    cacheData.flatAgentMaps = buildFlatAgentMaps([
      buildTrigger({ updatedFields: ['city'] }),
    ]);

    await job.handle(
      buildBatch([
        buildEvent('record-1', { updatedFields: ['name'] }),
        buildEvent('record-2', { updatedFields: ['city'] }),
      ]),
    );

    expect(enqueuedJobs()).toHaveLength(1);
    expect(enqueuedJobs()[0].payload).toMatchObject({
      events: [{ recordId: 'record-2' }],
    });
  });

  it('should ignore inactive triggers', async () => {
    cacheData.flatAgentMaps = buildFlatAgentMaps([buildTrigger({}, false)]);

    await job.handle(buildBatch([buildEvent('record-1')]));

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should not enqueue runs once the agent reached its run limit', async () => {
    agentTriggerThrottlerService.consumeAvailableRuns.mockResolvedValue(0);

    await job.handle(buildBatch([buildEvent('record-1')]));

    expect(
      agentTriggerThrottlerService.consumeAvailableRuns,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      agentId: AGENT_ID,
      requestedRunCount: 1,
    });
    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should enqueue the runs left in the allowance when a batch exceeds it', async () => {
    agentTriggerThrottlerService.consumeAvailableRuns.mockResolvedValue(1);

    await job.handle(
      buildBatch([buildEvent('record-1'), buildEvent('record-2')]),
    );

    expect(enqueuedJobs()).toHaveLength(1);
    expect(enqueuedJobs()[0].payload).toMatchObject({
      events: [{ recordId: 'record-1' }],
    });
  });
});
