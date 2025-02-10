import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useDeleteOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/jest';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  getPersonObjectMetadaItem,
  getRandomPersonRecord,
} from '~/testing/mock-data/people';

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

// TODO Should test relation deletion cache hydratation
describe('useDeleteOneRecord', () => {
  let cache!: InMemoryCache;
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
          deletePerson: responseData,
        },
      })),
      ...overrides,
    },
  ];
  const defaultMocks = getDefaultMocks();
  const personRecord = getRandomPersonRecord({
    id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
    deletedAt: null,
  });
  const objectMetadataItem = getPersonObjectMetadaItem();
  const objectMetadataItems = [objectMetadataItem];
  const assertCachedRecordMatch = (expectedRecord: ObjectRecord) => {
    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId: personRecord.id,
    });
    expect(cachedRecord).not.toBeNull();
    if (cachedRecord === null) throw new Error('Should never occur');
    expect(expectedRecord).toMatchObject(cachedRecord);
  };
  beforeEach(() => {
    jest.clearAllMocks();
    cache = new InMemoryCache();
  });

  describe('A. Starting from empty cache', () => {
    it('1. Should successfully delete record', async () => {
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks: defaultMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const deleteOneResult = await result.current.deleteOneRecord(
          personRecord.id,
        );
        const expectedResult: ObjectRecord = {
          __typename: personRecord.__typename,
          deletedAt: expect.any(String),
          id: personRecord.id,
        };
        expect(deleteOneResult).toStrictEqual(expectedResult);
        assertCachedRecordMatch(expectedResult);
      });

      expect(defaultMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });

    it('2. Should handle optimistic cache update on record deletion', async () => {
      const apolloMocks: MockedResponse[] = getDefaultMocks({
        delay: Number.POSITIVE_INFINITY,
      });
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            cache,
            apolloMocks,
          }),
        },
      );

      await act(async () => {
        result.current.deleteOneRecord(personRecord.id);
        await waitFor(() => {
          const expectedCachedRecord: ObjectRecord = {
            __typename: personRecord.__typename,
            deletedAt: expect.any(String),
            id: personRecord.id,
          };
          assertCachedRecordMatch(expectedCachedRecord);
        });
      });

      expect(defaultMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });

    it('3. Should handle optimistic cache update rollback on record deletion failure', async () => {
      const apolloMocks: MockedResponse[] = getDefaultMocks({
        error: new Error('Internal server error'),
      });
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            cache,
            apolloMocks,
          }),
        },
      );

      await act(async () => {
        try {
          await result.current.deleteOneRecord(personRecord.id);
          expect(false).toEqual(
            'Should never occur expected function to throw',
          );
        } catch (e) {
          const expectedCachedRecord: ObjectRecord = {
            __typename: personRecord.__typename,
            deletedAt: null,
            id: personRecord.id,
          };
          assertCachedRecordMatch(expectedCachedRecord);
        }
      });
    });
  });

  describe('B. Starting from filled cache', () => {
    beforeEach(() => {
      const recordGqlFields = generateDepthOneRecordGqlFields({
        objectMetadataItem,
        record: personRecord,
      });
      updateRecordFromCache({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        record: personRecord,
        recordGqlFields,
      });
    });

    it('1. Should handle successfull record deletion', async () => {
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks: defaultMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        const res = await result.current.deleteOneRecord(personRecord.id);
        expect(res).toBeDefined();
        expect(res.deletedAt).toBeDefined();
        expect(res).toHaveProperty('id', personRecord.id);

        const personRecordWithDeletedAt = {
          ...personRecord,
          deletedAt: expect.any(String),
        };
        assertCachedRecordMatch(personRecordWithDeletedAt);
      });

      expect(defaultMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });

    it('2. Should handle optimistic cache on record deletion', async () => {
      const apolloMocks = getDefaultMocks({
        // Used to assert loading state
        delay: Number.POSITIVE_INFINITY,
      });
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        result.current.deleteOneRecord(personRecord.id);
        await waitFor(() => {
          const personRecordWithDeletedAt = {
            ...personRecord,
            deletedAt: expect.any(String),
          };
          assertCachedRecordMatch(personRecordWithDeletedAt);
        });
      });

      expect(apolloMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });

    it('3. Should handle optimistic cache rollback on record deletion failure', async () => {
      const apolloMocks = getDefaultMocks({
        error: new Error('Internal server error'),
      });
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
          }),
        {
          wrapper: getJestMetadataAndApolloMocksWrapper({
            apolloMocks,
            cache,
          }),
        },
      );

      await act(async () => {
        try {
          await result.current.deleteOneRecord(personRecord.id);
          expect(false).toEqual(
            'Should never occur, expected function to throw',
          );
        } catch (e) {
          const personRecordWithDeletedAt = {
            ...personRecord,
            deletedAt: null,
          };
          assertCachedRecordMatch(personRecordWithDeletedAt);
        }
      });

      expect(apolloMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });
  });
});
