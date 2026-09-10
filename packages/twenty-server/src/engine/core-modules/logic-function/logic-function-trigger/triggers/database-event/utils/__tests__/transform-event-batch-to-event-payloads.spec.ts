import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const createMockLogicFunction = (
  overrides: Partial<LogicFunctionEntity> = {},
): LogicFunctionEntity =>
  ({
    id: 'function-1',
    workspaceId: 'workspace-1',
    databaseEventTriggerSettings: {
      eventName: 'company.updated',
    },
    ...overrides,
  }) as LogicFunctionEntity;

const createMockEvent = (
  overrides: Partial<ObjectRecordEvent> = {},
): ObjectRecordEvent =>
  ({
    recordId: 'record-1',
    properties: {
      after: {},
    },
    ...overrides,
  }) as ObjectRecordEvent;

const createMockWorkspaceEventBatch = (
  overrides: Partial<WorkspaceEventBatch<ObjectRecordEvent>> = {},
): WorkspaceEventBatch<ObjectRecordEvent> => ({
  name: 'company.updated',
  workspaceId: 'workspace-1',
  objectMetadata: getFlatObjectMetadataMock({
    universalIdentifier: 'company-uuid',
    nameSingular: 'company',
  }),
  events: [createMockEvent()],
  ...overrides,
});

describe('transformEventBatchToEventPayloads', () => {
  describe('triggering person', () => {
    it('should name the person whose mutation raised the event', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({
            userId: 'user-1',
            userWorkspaceId: 'user-workspace-1',
          }),
        ],
      });

      const [jobData] = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [createMockLogicFunction()],
      });

      expect(jobData).toMatchObject({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      });
    });

    it('should name nobody for a mutation with no user behind it', () => {
      const [jobData] = transformEventBatchToEventPayloads({
        workspaceEventBatch: createMockWorkspaceEventBatch(),
        logicFunctions: [createMockLogicFunction()],
      });

      expect(jobData).not.toHaveProperty('userId');
      expect(jobData).not.toHaveProperty('userWorkspaceId');
    });
  });

  describe('basic transformation', () => {
    it('should transform a single event batch with a single logic function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();
      const logicFunctions = [createMockLogicFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        logicFunctionId: 'function-1',
        workspaceId: 'workspace-1',
        payload: expect.objectContaining({
          name: 'company.updated',
          workspaceId: 'workspace-1',
          recordId: 'record-1',
        }),
      });
    });

    it('should create multiple payloads for multiple events in a batch', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({ recordId: 'record-1' }),
          createMockEvent({ recordId: 'record-2' }),
          createMockEvent({ recordId: 'record-3' }),
        ],
      });
      const logicFunctions = [createMockLogicFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-2', 'record-3']);
    });

    it('should create payloads for each logic function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();
      const logicFunctions = [
        createMockLogicFunction({
          id: 'function-1',
        }),
        createMockLogicFunction({
          id: 'function-2',
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.logicFunctionId)).toEqual([
        'function-1',
        'function-2',
      ]);
    });
  });

  describe('updatedFields filtering', () => {
    it('should include all events when updatedFields is undefined', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: { eventName: 'company.updated' },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
    });

    it('should include all events when updatedFields is empty array', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: [],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
    });

    it('should filter events to only those matching updatedFields', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-3',
            properties: { after: {}, updatedFields: ['name', 'description'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-3']);
    });

    it('should filter events matching any of the specified updatedFields', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-3',
            properties: { after: {}, updatedFields: ['phone'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name', 'address'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-2']);
    });

    it('should return no events when none match the updatedFields filter', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['phone'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(0);
    });

    it('should handle different updatedFields filters per logic function', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          id: 'function-1',
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name'],
          },
        }),
        createMockLogicFunction({
          id: 'function-2',
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['address'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);

      const function1Payloads = result.filter(
        (r) => r.logicFunctionId === 'function-1',
      );
      const function2Payloads = result.filter(
        (r) => r.logicFunctionId === 'function-2',
      );

      expect(function1Payloads).toHaveLength(1);
      expect((function1Payloads[0].payload as ObjectRecordEvent).recordId).toBe(
        'record-1',
      );

      expect(function2Payloads).toHaveLength(1);
      expect((function2Payloads[0].payload as ObjectRecordEvent).recordId).toBe(
        'record-2',
      );
    });
  });

  describe('position-only updates', () => {
    it('should include position-only events when the trigger has no updatedFields filter', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['position'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['name'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: { eventName: 'company.updated' },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-1', 'record-2']);
    });

    it('should include events that change other fields alongside position', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['position', 'name'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: { eventName: 'company.updated' },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(1);
    });

    it('should exclude position-only events when the trigger filters on another field', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.updated',
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['position'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['name'] },
          }),
        ],
      });
      const logicFunctions = [
        createMockLogicFunction({
          databaseEventTriggerSettings: {
            eventName: 'company.updated',
            updatedFields: ['name'],
          },
        }),
      ];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(1);
      expect(
        result.map((r) => (r.payload as ObjectRecordEvent).recordId),
      ).toEqual(['record-2']);
    });
  });

  describe('batchSize', () => {
    const createEvents = (
      count: number,
      overrides: Partial<ObjectRecordEvent> = {},
    ) =>
      Array.from({ length: count }, (_, index) =>
        createMockEvent({ recordId: `record-${index + 1}`, ...overrides }),
      );

    const getBatchedEvents = (payload: unknown) =>
      (payload as { events: ObjectRecordEvent[] }).events;

    it('should keep one job per event when batchSize is not set', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(3),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [createMockLogicFunction()],
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        logicFunctionId: 'function-1',
        workspaceId: 'workspace-1',
        payload: {
          name: 'company.updated',
          workspaceId: 'workspace-1',
          objectMetadata: workspaceEventBatch.objectMetadata,
          recordId: 'record-1',
          properties: { after: {} },
        },
      });
      result.forEach((jobData) => {
        expect(jobData.payload).not.toHaveProperty('events');
      });
    });

    it('should emit one job per chunk when batchSize exactly divides the event count', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(6),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 2,
            },
          }),
        ],
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((jobData) =>
          getBatchedEvents(jobData.payload).map((event) => event.recordId),
        ),
      ).toEqual([
        ['record-1', 'record-2'],
        ['record-3', 'record-4'],
        ['record-5', 'record-6'],
      ]);
      expect(result[0].payload).toMatchObject({
        name: 'company.updated',
        workspaceId: 'workspace-1',
      });
    });

    it('should emit a smaller last job for the remainder', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(5),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 2,
            },
          }),
        ],
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((jobData) => getBatchedEvents(jobData.payload).length),
      ).toEqual([2, 2, 1]);
    });

    it('should clamp a batchSize above the maximum', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(10),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 100_000,
            },
          }),
        ],
        maxBatchSize: 4,
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((jobData) => getBatchedEvents(jobData.payload).length),
      ).toEqual([4, 4, 2]);
    });

    it('should fall back to one event per job when the maximum is set to 1', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(3),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 100,
            },
          }),
        ],
        maxBatchSize: 1,
      });

      expect(result).toHaveLength(3);
      expect(
        result.map((jobData) => getBatchedEvents(jobData.payload).length),
      ).toEqual([1, 1, 1]);
    });

    it('should never mix events triggered by different users in the same job', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({
            recordId: 'record-1',
            userId: 'user-1',
            userWorkspaceId: 'user-workspace-1',
          }),
          createMockEvent({
            recordId: 'record-2',
            userId: 'user-2',
            userWorkspaceId: 'user-workspace-2',
          }),
          createMockEvent({
            recordId: 'record-3',
            userId: 'user-1',
            userWorkspaceId: 'user-workspace-1',
          }),
          createMockEvent({ recordId: 'record-4' }),
        ],
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 100,
            },
          }),
        ],
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      });
      expect(
        getBatchedEvents(result[0].payload).map((event) => event.recordId),
      ).toEqual(['record-1', 'record-3']);

      expect(result[1]).toMatchObject({
        userId: 'user-2',
        userWorkspaceId: 'user-workspace-2',
      });
      expect(
        getBatchedEvents(result[1].payload).map((event) => event.recordId),
      ).toEqual(['record-2']);

      expect(result[2]).not.toHaveProperty('userId');
      expect(result[2]).not.toHaveProperty('userWorkspaceId');
      expect(
        getBatchedEvents(result[2].payload).map((event) => event.recordId),
      ).toEqual(['record-4']);
    });

    it('should apply the updatedFields filter before chunking', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-2',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-3',
            properties: { after: {}, updatedFields: ['name'] },
          }),
          createMockEvent({
            recordId: 'record-4',
            properties: { after: {}, updatedFields: ['address'] },
          }),
          createMockEvent({
            recordId: 'record-5',
            properties: { after: {}, updatedFields: ['name'] },
          }),
        ],
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              updatedFields: ['name'],
              batchSize: 2,
            },
          }),
        ],
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((jobData) =>
          getBatchedEvents(jobData.payload).map((event) => event.recordId),
        ),
      ).toEqual([['record-1', 'record-3'], ['record-5']]);
    });

    it('should batch operations other than updated', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        name: 'company.created',
        events: createEvents(3),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.created',
              batchSize: 2,
            },
          }),
        ],
      });

      expect(result).toHaveLength(2);
      expect(
        result.map((jobData) => getBatchedEvents(jobData.payload).length),
      ).toEqual([2, 1]);
    });

    it('should batch per logic function so an unbatched one keeps one job per event', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: createEvents(4),
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({ id: 'function-1' }),
          createMockLogicFunction({
            id: 'function-2',
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              batchSize: 4,
            },
          }),
        ],
      });

      expect(
        result.filter((jobData) => jobData.logicFunctionId === 'function-1'),
      ).toHaveLength(4);

      const batchedJobs = result.filter(
        (jobData) => jobData.logicFunctionId === 'function-2',
      );

      expect(batchedJobs).toHaveLength(1);
      expect(getBatchedEvents(batchedJobs[0].payload)).toHaveLength(4);
    });

    it('should emit no job when every event is filtered out', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [
          createMockEvent({
            recordId: 'record-1',
            properties: { after: {}, updatedFields: ['address'] },
          }),
        ],
      });

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [
          createMockLogicFunction({
            databaseEventTriggerSettings: {
              eventName: 'company.updated',
              updatedFields: ['name'],
              batchSize: 10,
            },
          }),
        ],
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no logic functions provided', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch();

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions: [],
      });

      expect(result).toHaveLength(0);
    });

    it('should return empty array when no events in batch', () => {
      const workspaceEventBatch = createMockWorkspaceEventBatch({
        events: [],
      });
      const logicFunctions = [createMockLogicFunction()];

      const result = transformEventBatchToEventPayloads({
        workspaceEventBatch,
        logicFunctions,
      });

      expect(result).toHaveLength(0);
    });
  });
});
