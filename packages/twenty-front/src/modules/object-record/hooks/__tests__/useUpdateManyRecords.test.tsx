import { renderHook, waitFor } from '@testing-library/react';

import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import {
  personIds,
  personRecords,
  query,
  responseData,
  updateInput,
  variables,
} from '@/object-record/hooks/__mocks__/useUpdateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache } from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import { act } from 'react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

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
        updatePeople: responseData,
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

const objectMetadataItem = getMockPersonObjectMetadataItem();
const objectMetadataItems = generatedMockObjectMetadataItems;

const expectedCachedRecordsWithUpdatedCity = personRecords.map(
  (personRecord) => ({
    ...personRecord,
    city: 'Updated City',
  }),
);

describe('useUpdateManyRecords', () => {
  let cache: InMemoryCache;

  const assertCachedRecordsMatch = (expectedRecords: ObjectRecord[]) => {
    expectedRecords.forEach((expectedRecord) => {
      const cachedRecord = getRecordFromCache({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        recordId: expectedRecord.id,
        objectPermissionsByObjectMetadataId: {},
      });
      expect(cachedRecord).not.toBeNull();
      if (cachedRecord === null) throw new Error('Should never occur');
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
          objectPermissionsByObjectMetadataId: {},
        }),
      ).toBeNull(),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new InMemoryCache();
  });

  describe('A. Starting from empty cache', () => {
    it('1. Should handle update many records when cache is empty', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useUpdateManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const res = await result.current.updateManyRecords({
          recordIdsToUpdate: personIds,
          updateOneRecordInput: updateInput,
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
          recordGqlFields: generateDepthRecordGqlFieldsFromRecord({
            objectMetadataItems: generatedMockObjectMetadataItems,
            objectMetadataItem,
            record,
            depth: 1,
          }),
          objectPermissionsByObjectMetadataId: {},
        }),
      );
    });

    it('1. Should handle optimistic behavior after many successful records update', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useUpdateManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const res = await result.current.updateManyRecords({
          recordIdsToUpdate: personIds,
          updateOneRecordInput: updateInput,
        });
        expect(res).toEqual(responseData);
        assertCachedRecordsMatch(expectedCachedRecordsWithUpdatedCity);
      });

      expect(apolloMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });

    it('2. Should handle optimistic behavior before send many record update', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useUpdateManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks: getDefaultMocks({
              delay: Number.POSITIVE_INFINITY,
            }),
            cache,
          }),
        },
      );

      await act(async () => {
        result.current.updateManyRecords({
          recordIdsToUpdate: personIds,
          updateOneRecordInput: updateInput,
        });
        await waitFor(() =>
          assertCachedRecordsMatch(expectedCachedRecordsWithUpdatedCity),
        );
      });

      expect(apolloMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });

    it('3. Should rollback optimistic behavior after failing to update many records', async () => {
      const apolloMocks = getDefaultMocks();
      const { result } = renderHook(
        () => useUpdateManyRecords({ objectNameSingular: 'person' }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks: getDefaultMocks({
              error: new Error('Internal server error'),
            }),
            cache,
          }),
        },
      );

      await act(async () => {
        try {
          await result.current.updateManyRecords({
            recordIdsToUpdate: personIds,
            updateOneRecordInput: updateInput,
          });
          fail('Should have thrown an error');
        } catch (e) {
          expect(e).toMatchInlineSnapshot(
            `[ApolloError: Internal server error]`,
          );
          assertCachedRecordsMatch(personRecords);
        }
      });

      expect(apolloMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });
  });
});
