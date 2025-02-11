import { renderHook } from '@testing-library/react';

import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import {
  personIds,
  personRecords,
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useDeleteManyRecords';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { act } from 'react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getPersonObjectMetadaItem } from '~/testing/mock-data/people';
// const { personIds, personRecords, query, responseData, variables } =
//   useDeleteManyRecordsMocks;
const getDefaultMocks = (
  overrides?: Partial<MockedResponse>,
): MockedResponse[] => [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        deletePeople: responseData,
      },
    })),
    ...overrides,
  },
];

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});
const objectMetadataItem = getPersonObjectMetadaItem();
const objectMetadataItems = [objectMetadataItem];
describe('useDeleteManyRecords', () => {
  let cache!: InMemoryCache;
  const assertCachedRecordsMatch = (expectedRecords: ObjectRecord[]) => {
    expectedRecords.forEach((expectedRecord) => {
      const cachedRecord = getRecordFromCache({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        recordId: expectedRecord.id,
      });
      expect(cachedRecord).not.toBeNull();
      if (cachedRecord === null) throw new Error('Should never occur');
      // TODO find a way to reverse assertion
      expect(expectedRecord).toMatchObject(cachedRecord);
    });
  };
  const assertCachedRecordsIsNull = (recordIds: string[]) =>
    recordIds.forEach((recordId) =>
      expect(
        getRecordFromCache({
          cache,
          objectMetadataItem,
          objectMetadataItems,
          recordId,
        }),
      ).toBeNull(),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new InMemoryCache();
  });

  describe('A. Starting from empty cache ', () => {
    it('1. Should handle optimistic behavior after many records deletion', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useDeleteManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const res = await result.current.deleteManyRecords({
          recordIdsToDelete: personIds,
        });
        expect(res).toEqual(responseData);
        assertCachedRecordsIsNull(personIds);
      });

      expect(apolloMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });
  });

  describe('B. Starting from filled cache', () => {
    beforeEach(() => {
      personRecords.forEach((record) =>
        updateRecordFromCache({
          cache,
          objectMetadataItem,
          objectMetadataItems,
          record,
          recordGqlFields: generateDepthOneRecordGqlFields({
            objectMetadataItem,
            record,
          }),
        }),
      );
    });
    it('1. Should handle optimistic behavior after many records successfull deletion', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useDeleteManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const res = await result.current.deleteManyRecords({
          recordIdsToDelete: personIds,
        });
        expect(res).toEqual(responseData);
        const expectedCachedRecordsWithDeletedAt = personRecords.map(
          (personRecord) => ({
            ...personRecord,
            deletedAt: expect.any(String),
          }),
        );
        assertCachedRecordsMatch(expectedCachedRecordsWithDeletedAt);
      });

      expect(apolloMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });
  });
});
