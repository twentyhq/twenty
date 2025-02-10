import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useDeleteOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { InMemoryCache } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/jest';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const personId = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';

const mocks: MockedResponse[] = [
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
  },
];

// TODO make a util
const getPersonObjectMetadaItem = () => {
  const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  );

  if (!personObjectMetadataItem) {
    throw new Error('Person object metadata item not found');
  }

  return personObjectMetadataItem;
};
const objectMetadataItem = getPersonObjectMetadaItem();
const objectMetadataItems = [objectMetadataItem]

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

// Refactor this test suite to cover following workflows:
// Handle optimistic cache SNAPSHOT, then call API, then trigger relationship with returned record SNAPSHOT
// Handle optimistic cache SNAPSHOT all msw mocks with error to test rollback of the optimistic cache SNAPSHOT
//
describe('useDeleteOneRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should handle optimistic cache on successfull record deletion starting from empty cache', async () => {
    const cache = new InMemoryCache();
    const { result } = renderHook(
      () => useDeleteOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          apolloMocks: mocks,
          cache,
        }),
      },
    );

    await act(async () => {
      const res = await result.current.deleteOneRecord(personId);
      console.log(res)
      expect(res).toBeDefined();
      expect(res.deletedAt).toBeDefined();
      expect(res).toHaveProperty('id', personId);

      const cachedRecord = getRecordFromCache({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        recordId: personId,
      });
      expect(cachedRecord).toMatchInlineSnapshot(`
{
  "__typename": "Person",
  "deletedAt": "2024-02-14T09:45:00Z",
  "id": "a7286b9a-c039-4a89-9567-2dfa7953cda9",
}
`)
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });

  it('Sould handle optimistic cache rollback on record deletion failure starting from empty cache', async () => {
    const cache = new InMemoryCache();
    const apolloMocks: MockedResponse[] = [
      {
        request: {
          query,
          variables,
        },
        error: new Error('Internal server error'),
      },
    ];
    const { result } = renderHook(
      () => useDeleteOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          cache,
          apolloMocks,
        }),
      },
    );

    await act(async () => {
      // Could not make it work with expect error
      try {
        await result.current.deleteOneRecord(personId);
        throw new Error('Should never occurs, expected function to throw');
      } catch (e) {
        const snapshot = getRecordFromCache({
          cache,
          objectMetadataItem,
          objectMetadataItems,
          recordId: personId,
        });
        expect(snapshot).toMatchInlineSnapshot(`
{
  "__typename": "Person",
  "deletedAt": null,
  "id": "a7286b9a-c039-4a89-9567-2dfa7953cda9",
}
`);
      }
    });
  });
});
