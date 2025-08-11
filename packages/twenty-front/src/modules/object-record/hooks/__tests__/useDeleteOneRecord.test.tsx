import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { query } from '@/object-record/hooks/__mocks__/useDeleteOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { type MockedResponse } from '@apollo/client/testing';

import { InMemoryTestingCacheInstance } from '~/testing/cache/inMemoryTestingCacheInstance';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import {
  allMockCompanyRecordsWithRelation,
  findMockCompanyWithRelationRecord,
} from '~/testing/mock-data/companiesWithRelations';
import {
  allMockPersonRecords,
  getMockPersonObjectMetadataItem,
  getMockPersonRecord,
} from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

describe('useDeleteOneRecord', () => {
  const personRecord = getMockPersonRecord({
    deletedAt: null,
  });
  const relatedCompanyRecord = findMockCompanyWithRelationRecord({
    id: personRecord.company.id,
  });
  const personObjectMetadataItem = getMockPersonObjectMetadataItem();
  const companyObjectMetadataItem = getMockCompanyObjectMetadataItem();
  const objectMetadataItems = generatedMockObjectMetadataItems;

  const getDefaultMocks = (
    overrides?: Partial<MockedResponse>,
  ): MockedResponse[] => {
    const deleteOneQueryMock: MockedResponse<
      Record<string, any>,
      Record<'idToDelete', string>
    > = {
      request: {
        variables: { idToDelete: personRecord.id },
        query,
      },
      result: jest.fn((variables) => ({
        data: {
          deletePerson: {
            __typename: 'Person',
            deletedAt: '2024-02-14T09:45:00Z',
            id: variables.idToDelete,
          },
        },
      })),
      ...overrides,
    };
    return [deleteOneQueryMock];
  };
  const defaultMocks = getDefaultMocks();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('A. Starting from empty cache', () => {
    const {
      cache,
      assertCachedRecordIsNull,
      assertCachedRecordMatchSnapshot,
      restoreCacheToInitialState,
    } = new InMemoryTestingCacheInstance({
      objectMetadataItems,
    });
    beforeEach(async () => restoreCacheToInitialState());

    it('1. Should successfully delete record and update record cache entry', async () => {
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
        expect(deleteOneResult).toStrictEqual({
          __typename: personRecord.__typename,
          deletedAt: expect.any(String),
          id: personRecord.id,
        });
        assertCachedRecordMatchSnapshot({
          recordId: personRecord.id,
          objectMetadataItem: personObjectMetadataItem,
          matchObject: {
            deletedAt: expect.any(String),
          },
        });
        assertCachedRecordIsNull({
          objectMetadataItem: companyObjectMetadataItem,
          recordId: personRecord.company.id,
        });
      });

      expect(defaultMocks[0].result).toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    });

    it('2. Should not handle optimistic cache update on record deletion', async () => {
      const apolloMocks: MockedResponse[] = getDefaultMocks({
        delay: Number.POSITIVE_INFINITY,
      });
      expect(personRecord).toHaveProperty('company');
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
          assertCachedRecordIsNull({
            recordId: personRecord.id,
            objectMetadataItem: personObjectMetadataItem,
          });
          assertCachedRecordIsNull({
            recordId: personRecord.company.id,
            objectMetadataItem: companyObjectMetadataItem,
          });
        });
      });

      expect(defaultMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });

    it('3. Should not handle optimistic cache update rollback on record deletion failure', async () => {
      const apolloMocks: MockedResponse[] = getDefaultMocks({
        error: new Error('Internal server error'),
      });
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
          fail('Should have thrown an error');
        } catch {
          assertCachedRecordIsNull({
            recordId: personRecord.id,
            objectMetadataItem: personObjectMetadataItem,
          });
          assertCachedRecordIsNull({
            recordId: relatedCompanyRecord.id,
            objectMetadataItem: companyObjectMetadataItem,
          });
        }
      });
    });
  });

  describe('B. Starting from filled cache', () => {
    const {
      assertCachedRecordMatchSnapshot,
      cache,
      restoreCacheToInitialState,
    } = new InMemoryTestingCacheInstance({
      objectMetadataItems,
      initialRecordsInCache: [
        {
          objectMetadataItem: companyObjectMetadataItem,
          records: allMockCompanyRecordsWithRelation,
        },
        {
          objectMetadataItem: personObjectMetadataItem,
          records: allMockPersonRecords,
        },
      ],
    });

    beforeEach(() => {
      restoreCacheToInitialState();
    });

    it('1. Should handle successfull record deletion', async () => {
      const { result } = renderHook(
        () =>
          useDeleteOneRecord({
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
        expect(res).toMatchObject({
          __typename: 'Person',
          id: personRecord.id,
          deletedAt: expect.any(String),
        });

        assertCachedRecordMatchSnapshot({
          recordId: personRecord.id,
          objectMetadataItem: personObjectMetadataItem,
          matchObject: {
            deletedAt: expect.any(String),
          },
        });
        assertCachedRecordMatchSnapshot({
          objectMetadataItem: companyObjectMetadataItem,
          recordId: personRecord.company.id,
        });
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
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
          assertCachedRecordMatchSnapshot({
            recordId: personRecord.id,
            objectMetadataItem: personObjectMetadataItem,
            snapshotPropertyMatchers: {
              // Request is paused then the cached get filled with optmistic deletedAt
              deletedAt: expect.any(String),
            },
            matchObject: {
              deletedAt: expect.any(String),
            },
          });
          assertCachedRecordMatchSnapshot({
            objectMetadataItem: companyObjectMetadataItem,
            recordId: personRecord.company.id,
          });
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
            objectNameSingular: personObjectMetadataItem.nameSingular,
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
          fail('Should have thrown an error');
        } catch {
          assertCachedRecordMatchSnapshot({
            recordId: personRecord.id,
            objectMetadataItem: personObjectMetadataItem,
            matchObject: {
              deletedAt: null,
            },
          });
          assertCachedRecordMatchSnapshot({
            objectMetadataItem: companyObjectMetadataItem,
            recordId: personRecord.company.id,
          });
        }
      });

      expect(apolloMocks[0].result).not.toHaveBeenCalled();
      expect(mockRefetchAggregateQueries).not.toHaveBeenCalled();
    });
  });
});
