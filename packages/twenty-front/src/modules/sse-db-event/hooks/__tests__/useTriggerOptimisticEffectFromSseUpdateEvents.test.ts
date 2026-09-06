import { renderHook } from '@testing-library/react';
import { useStore } from 'jotai';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useTriggerOptimisticEffectFromSseUpdateEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseUpdateEvents';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-record/hooks/useObjectPermissions');
jest.mock(
  '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem',
);
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore');
jest.mock('@/object-record/cache/utils/getRecordFromCache');
jest.mock('@/object-record/cache/utils/getRecordNodeFromRecord');
jest.mock('@/object-record/cache/utils/updateRecordFromCache');
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect',
);
jest.mock('@/object-record/utils/computeOptimisticRecordFromInput', () => ({
  computeOptimisticRecordFromInput: jest.fn(({ recordInput }) => ({
    ...recordInput,
  })),
}));
jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord',
  () => ({
    generateDepthRecordGqlFieldsFromRecord: jest.fn(() => ({})),
  }),
);

describe('useTriggerOptimisticEffectFromSseUpdateEvents', () => {
  const mockRefetchAggregateQueries = jest.fn();
  const mockUpsertRecordsInStore = jest.fn();

  const mockObjectMetadataItem = {
    id: 'person-metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
    fields: [
      { id: 'f1', name: 'firstName' },
      { id: 'f2', name: 'lastName' },
      { id: 'f3', name: 'updatedAt' },
    ],
  } as unknown as EnrichedObjectMetadataItem;

  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue([mockObjectMetadataItem]),
    });

    (useApolloCoreClient as jest.Mock).mockReturnValue({
      cache: {},
    });

    (useObjectPermissions as jest.Mock).mockReturnValue({
      objectPermissionsByObjectMetadataId: {},
    });

    (
      useRefetchAggregateQueriesForObjectMetadataItem as jest.Mock
    ).mockReturnValue({
      refetchAggregateQueriesForObjectMetadataItem: mockRefetchAggregateQueries,
    });

    (useUpsertRecordsInStore as jest.Mock).mockReturnValue({
      upsertRecordsInStore: mockUpsertRecordsInStore,
    });
  });

  it('skips aggregate refetch when updated record values match cached values (no-op / self-echo)', () => {
    const cachedRecord = {
      id: 'rec-1',
      firstName: 'John',
      lastName: 'Doe',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    (getRecordFromCache as jest.Mock).mockReturnValue(cachedRecord);
    (getRecordNodeFromRecord as jest.Mock).mockReturnValue(cachedRecord);

    const sseEvent: ObjectRecordEvent = {
      action: DatabaseEventAction.UPDATED,
      objectNameSingular: 'person',
      recordId: 'rec-1',
      properties: {
        after: {
          id: 'rec-1',
          firstName: 'John',
          lastName: 'Doe',
          updatedAt: '2026-01-01T00:01:00.000Z',
        },
        updatedFields: ['firstName', 'updatedAt'],
      },
    };

    const { result } = renderHook(() =>
      useTriggerOptimisticEffectFromSseUpdateEvents(),
    );

    result.current.triggerOptimisticEffectFromSseUpdateEvents({
      objectRecordEvents: [sseEvent],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
  });

  it('triggers aggregate refetch when at least one field value differs from cache', () => {
    const cachedRecord = {
      id: 'rec-1',
      firstName: 'John',
      lastName: 'Doe',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    (getRecordFromCache as jest.Mock).mockReturnValue(cachedRecord);
    (getRecordNodeFromRecord as jest.Mock).mockReturnValue(cachedRecord);

    const sseEvent: ObjectRecordEvent = {
      action: DatabaseEventAction.UPDATED,
      objectNameSingular: 'person',
      recordId: 'rec-1',
      properties: {
        after: {
          id: 'rec-1',
          firstName: 'Jane',
          lastName: 'Doe',
          updatedAt: '2026-01-01T00:01:00.000Z',
        },
        updatedFields: ['firstName', 'updatedAt'],
      },
    };

    const { result } = renderHook(() =>
      useTriggerOptimisticEffectFromSseUpdateEvents(),
    );

    result.current.triggerOptimisticEffectFromSseUpdateEvents({
      objectRecordEvents: [sseEvent],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchAggregateQueries).toHaveBeenCalledWith({
      objectMetadataItem: mockObjectMetadataItem,
    });
  });

  it('triggers aggregate refetch when record is not found in cache (conservative fallback)', () => {
    (getRecordFromCache as jest.Mock).mockReturnValue(null);
    (getRecordNodeFromRecord as jest.Mock).mockReturnValue(null);

    const sseEvent: ObjectRecordEvent = {
      action: DatabaseEventAction.UPDATED,
      objectNameSingular: 'person',
      recordId: 'rec-2',
      properties: {
        after: {
          id: 'rec-2',
          firstName: 'Alice',
        },
      },
    };

    const { result } = renderHook(() =>
      useTriggerOptimisticEffectFromSseUpdateEvents(),
    );

    result.current.triggerOptimisticEffectFromSseUpdateEvents({
      objectRecordEvents: [sseEvent],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });
});
