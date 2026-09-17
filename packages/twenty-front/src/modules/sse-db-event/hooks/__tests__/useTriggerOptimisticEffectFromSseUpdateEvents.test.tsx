import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { personRecords } from '@/object-record/hooks/__mocks__/useUpdateManyRecords';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useTriggerOptimisticEffectFromSseUpdateEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseUpdateEvents';
import { InMemoryCache } from '@apollo/client';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock(
  '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem',
);
const mockRefetchAggregateQueriesForObjectMetadataItem = jest.fn();
(useRefetchAggregateQueriesForObjectMetadataItem as jest.Mock).mockReturnValue({
  refetchAggregateQueriesForObjectMetadataItem:
    mockRefetchAggregateQueriesForObjectMetadataItem,
});

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

const objectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const cachedPerson = personRecords[0];

const buildUpdateEvent = (
  after: Record<string, unknown>,
): ObjectRecordEvent => ({
  action: DatabaseEventAction.UPDATED,
  objectNameSingular: 'person',
  recordId: cachedPerson.id,
  properties: { after },
});

const echoEvent = buildUpdateEvent({
  id: cachedPerson.id,
  city: cachedPerson.city,
  updatedAt: cachedPerson.updatedAt,
});

const genuineUpdateEvent = buildUpdateEvent({
  id: cachedPerson.id,
  city: 'Updated City',
  updatedAt: '2026-09-17T07:00:00.000Z',
});

describe('useTriggerOptimisticEffectFromSseUpdateEvents', () => {
  let cache: InMemoryCache;

  const getCachedPerson = () =>
    getRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId: cachedPerson.id,
      objectPermissionsByObjectMetadataId: {},
    });

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new InMemoryCache();

    updateRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      record: cachedPerson,
      recordGqlFields: generateDepthRecordGqlFieldsFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        record: cachedPerson,
        depth: 1,
      }),
      objectPermissionsByObjectMetadataId: {},
    });
  });

  it('skips an event the cache already holds and does not refetch aggregates', () => {
    const { result } = renderHook(
      () => useTriggerOptimisticEffectFromSseUpdateEvents(),
      { wrapper: getJestMetadataAndApolloMocksWrapper({ cache }) },
    );

    let hasAppliedUpdate: boolean | undefined;

    act(() => {
      hasAppliedUpdate =
        result.current.triggerOptimisticEffectFromSseUpdateEvents({
          objectRecordEvents: [echoEvent],
          objectMetadataItem,
        });
    });

    expect(hasAppliedUpdate).toBe(false);
    expect(getCachedPerson()?.city).toBe(cachedPerson.city);
    expect(
      mockRefetchAggregateQueriesForObjectMetadataItem,
    ).not.toHaveBeenCalled();
  });

  it('applies a genuine update from a mixed batch and refetches aggregates once', () => {
    const { result } = renderHook(
      () => useTriggerOptimisticEffectFromSseUpdateEvents(),
      { wrapper: getJestMetadataAndApolloMocksWrapper({ cache }) },
    );

    let hasAppliedUpdate: boolean | undefined;

    act(() => {
      hasAppliedUpdate =
        result.current.triggerOptimisticEffectFromSseUpdateEvents({
          objectRecordEvents: [echoEvent, genuineUpdateEvent],
          objectMetadataItem,
        });
    });

    expect(hasAppliedUpdate).toBe(true);
    expect(getCachedPerson()?.city).toBe('Updated City');
    expect(
      mockRefetchAggregateQueriesForObjectMetadataItem,
    ).toHaveBeenCalledTimes(1);
  });
});
