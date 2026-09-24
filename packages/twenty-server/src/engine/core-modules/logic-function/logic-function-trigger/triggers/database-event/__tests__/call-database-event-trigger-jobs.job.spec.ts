import { Test, type TestingModule } from '@nestjs/testing';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  MetadataReadability,
  type ObjectsPermissionsByRoleId,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_METADATA_ID = 'company-object-id';
const NAME_FIELD_ID = 'name-field-id';
const SALARY_FIELD_ID = 'salary-field-id';
const CITY_FIELD_ID = 'city-field-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_ROLE_ID = 'application-role-id';
const LOGIC_FUNCTION_ID = 'logic-function-id';

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
    id: SALARY_FIELD_ID,
    universalIdentifier: SALARY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.NUMBER,
    name: 'salary',
  }),
  getFlatFieldMetadataMock({
    id: CITY_FIELD_ID,
    universalIdentifier: CITY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'city',
  }),
]);

const buildObjectMetadata = (readability: MetadataReadability) =>
  getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: OBJECT_METADATA_ID,
    nameSingular: 'company',
    namePlural: 'companies',
    applicationId: 'other-application-id',
    readability,
    fieldIds: [NAME_FIELD_ID, SALARY_FIELD_ID, CITY_FIELD_ID],
    fieldUniversalIdentifiers: [NAME_FIELD_ID, SALARY_FIELD_ID, CITY_FIELD_ID],
  });

const buildEvent = (
  recordId: string,
  record: Record<string, unknown>,
  updatedFields = ['name', 'salary'],
): ObjectRecordUpdateEvent =>
  ({
    recordId,
    userId: 'user-id',
    userWorkspaceId: 'user-workspace-id',
    properties: {
      updatedFields,
      before: { id: recordId, ...record, name: 'Old' },
      after: { id: recordId, ...record },
      diff: {
        name: { before: 'Old', after: record.name },
        salary: { before: 0, after: record.salary },
      },
    },
  }) as unknown as ObjectRecordUpdateEvent;

const buildRolesPermissions = ({
  canReadObjectRecords = true,
  restrictedFields = {},
}: {
  canReadObjectRecords?: boolean;
  restrictedFields?: Record<string, { canRead: boolean; canUpdate: boolean }>;
} = {}): ObjectsPermissionsByRoleId => ({
  [APPLICATION_ROLE_ID]: {
    [OBJECT_METADATA_ID]: {
      canReadObjectRecords,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
  },
});

describe('CallDatabaseEventTriggerJobsJob', () => {
  let job: CallDatabaseEventTriggerJobsJob;
  let messageQueueService: { bulkAdd: jest.Mock };
  let recordShareStorageService: { findByRecordIds: jest.Mock };
  let recordSharingFeatureService: {
    isRecordSharingEnabled: jest.Mock;
    isLegacyRecordAccessOpen: jest.Mock;
  };
  let cacheData: Record<string, unknown>;

  const buildBatch = (
    events: ObjectRecordUpdateEvent[],
    readability = MetadataReadability.OPEN,
  ): WorkspaceEventBatch<ObjectRecordUpdateEvent> => ({
    name: 'company.updated',
    workspaceId: WORKSPACE_ID,
    objectMetadata: buildObjectMetadata(readability),
    events,
  });

  const enqueuedPayloads = () =>
    messageQueueService.bulkAdd.mock.calls.flatMap(([, jobs]) =>
      (jobs as { data: { payload: ObjectRecordUpdateEvent } }[]).map(
        (enqueuedJob) => enqueuedJob.data.payload,
      ),
    );

  beforeEach(async () => {
    cacheData = {
      featureFlagsMap: {},
      flatLogicFunctionMaps: buildMaps([
        {
          id: LOGIC_FUNCTION_ID,
          universalIdentifier: LOGIC_FUNCTION_ID,
          workspaceId: WORKSPACE_ID,
          applicationId: APPLICATION_ID,
          databaseEventTriggerSettings: { eventName: 'company.updated' },
          deletedAt: null,
        },
      ]),
      flatApplicationMaps: {
        byId: {
          [APPLICATION_ID]: {
            id: APPLICATION_ID,
            applicationRegistrationId: 'application-registration-id',
            defaultRoleId: APPLICATION_ROLE_ID,
            deletedAt: null,
          },
        },
        idByUniversalIdentifier: {},
      },
      rolesPermissions: buildRolesPermissions(),
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      flatFieldMetadataMaps,
      flatFieldMetadataMapsOrm: flatFieldMetadataMaps,
    };

    messageQueueService = { bulkAdd: jest.fn().mockResolvedValue(undefined) };
    recordShareStorageService = {
      findByRecordIds: jest.fn().mockResolvedValue([]),
    };
    recordSharingFeatureService = {
      isLegacyRecordAccessOpen: jest.fn().mockResolvedValue(false),
      isRecordSharingEnabled: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallDatabaseEventTriggerJobsJob,
        RecordAccessPolicyService,
        {
          provide: getQueueToken(MessageQueue.logicFunctionQueue),
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
          provide: ApplicationJobEnqueueThrottlerService,
          useValue: { throttleOrThrow: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: RecordShareStorageService,
          useValue: recordShareStorageService,
        },
        {
          provide: RecordSharingFeatureService,
          useValue: recordSharingFeatureService,
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

    job = module.get(CallDatabaseEventTriggerJobsJob);
  });

  it('should enqueue the events of an object the application role reads', async () => {
    const event = buildEvent('record-1', { name: 'New', salary: 10 });

    await job.handle(buildBatch([event]));

    expect(messageQueueService.bulkAdd).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      [
        {
          data: expect.objectContaining({
            logicFunctionId: LOGIC_FUNCTION_ID,
            workspaceId: WORKSPACE_ID,
            userId: 'user-id',
            userWorkspaceId: 'user-workspace-id',
            payload: expect.objectContaining(event),
          }),
        },
      ],
      expect.anything(),
    );
  });

  it('should not enqueue events of an object the application role cannot read', async () => {
    cacheData.rolesPermissions = buildRolesPermissions({
      canReadObjectRecords: false,
    });

    await job.handle(
      buildBatch([buildEvent('record-1', { name: 'New', salary: 10 })]),
    );

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should not enqueue events for an application without a role', async () => {
    (
      cacheData.flatApplicationMaps as {
        byId: Record<string, { defaultRoleId: string | null }>;
      }
    ).byId[APPLICATION_ID].defaultRoleId = null;

    await job.handle(
      buildBatch([buildEvent('record-1', { name: 'New', salary: 10 })]),
    );

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should not enqueue events for an application whose role permissions are unknown', async () => {
    cacheData.rolesPermissions = {};

    await job.handle(
      buildBatch([buildEvent('record-1', { name: 'New', salary: 10 })]),
    );

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should only enqueue the events passing the role row-level filter', async () => {
    cacheData.flatRowLevelPermissionPredicateMaps = buildMaps([
      {
        id: 'predicate-city',
        universalIdentifier: 'predicate-city',
        roleId: APPLICATION_ROLE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        fieldMetadataId: CITY_FIELD_ID,
        operand: 'CONTAINS',
        value: 'Paris',
        subFieldName: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
        rowLevelPermissionPredicateGroupId: null,
        positionInRowLevelPermissionPredicateGroup: null,
        deletedAt: null,
      },
    ]);

    await job.handle(
      buildBatch([
        buildEvent('record-paris', { name: 'A', salary: 1, city: 'Paris' }),
        buildEvent('record-berlin', { name: 'B', salary: 2, city: 'Berlin' }),
      ]),
    );

    expect(enqueuedPayloads().map((payload) => payload.recordId)).toEqual([
      'record-paris',
    ]);
  });

  it('should omit the fields the application role cannot read', async () => {
    cacheData.rolesPermissions = buildRolesPermissions({
      restrictedFields: {
        [SALARY_FIELD_ID]: { canRead: false, canUpdate: false },
      },
    });

    await job.handle(
      buildBatch([buildEvent('record-1', { name: 'New', salary: 10 })]),
    );

    expect(enqueuedPayloads()[0].properties).toEqual({
      updatedFields: ['name'],
      before: { id: 'record-1', name: 'Old' },
      after: { id: 'record-1', name: 'New' },
      diff: { name: { before: 'Old', after: 'New' } },
    });
  });

  it('should not enqueue an update touching only fields the application role cannot read', async () => {
    cacheData.rolesPermissions = buildRolesPermissions({
      restrictedFields: {
        [SALARY_FIELD_ID]: { canRead: false, canUpdate: false },
      },
    });

    await job.handle(
      buildBatch([
        buildEvent('record-1', { name: 'Same', salary: 10 }, ['salary']),
      ]),
    );

    expect(messageQueueService.bulkAdd).not.toHaveBeenCalled();
  });

  it('should only enqueue the events of a private object shared with the application role', async () => {
    recordSharingFeatureService.isRecordSharingEnabled.mockResolvedValue(true);
    recordShareStorageService.findByRecordIds.mockResolvedValue([
      {
        id: 'record-share-1',
        recordId: 'record-shared',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: APPLICATION_ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: 'source-1',
      },
    ]);

    await job.handle(
      buildBatch(
        [
          buildEvent('record-private', { name: 'A', salary: 1 }),
          buildEvent('record-shared', { name: 'B', salary: 2 }),
        ],
        MetadataReadability.PRIVATE,
      ),
    );

    expect(enqueuedPayloads().map((payload) => payload.recordId)).toEqual([
      'record-shared',
    ]);
  });
});
