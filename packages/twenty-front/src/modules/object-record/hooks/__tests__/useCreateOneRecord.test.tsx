import { gql, InMemoryCache } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';

import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  query,
  responseData,
} from '@/object-record/hooks/__mocks__/useCreateOneRecord';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const PERSON_ID = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(() => 'a7286b9a-c039-4a89-9567-2dfa7953cda9'),
}));

const input = { name: { firstName: 'John', lastName: 'Doe' } };

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

const mocks = [
  {
    request: {
      query,
      variables: { input: { ...input, id: PERSON_ID } },
    },
    result: jest.fn(() => ({
      data: {
        createPerson: { ...responseData, ...input, id: PERSON_ID },
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateOneRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('works as expected', async () => {
    const { result } = renderHook(
      () =>
        useCreateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createOneRecord(input);
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', PERSON_ID);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });

  it('keeps cached counts when the server rejects the record', async () => {
    const rejectedInput = { name: { firstName: 'Jane', lastName: 'Doe' } };
    const cachedPeopleQuery = gql`
      query CachedPeople {
        people {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    const cache = new InMemoryCache();

    cache.writeQuery({
      query: cachedPeopleQuery,
      data: {
        people: { __typename: 'PersonConnection', totalCount: 5, edges: [] },
      },
    });

    const RejectingWrapper = getJestMetadataAndApolloMocksWrapper({
      cache,
      apolloMocks: [
        {
          request: {
            query,
            variables: { input: { ...rejectedInput, id: PERSON_ID } },
          },
          error: new Error('A code is required'),
        },
      ],
    });

    const { result } = renderHook(
      () =>
        useCreateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      { wrapper: RejectingWrapper },
    );

    await act(async () => {
      await expect(
        result.current.createOneRecord(rejectedInput),
      ).rejects.toThrow('A code is required');
    });

    expect(
      cache.readQuery<{ people: { totalCount: number } }>({
        query: cachedPeopleQuery,
      })?.people.totalCount,
    ).toBe(5);
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchAggregateQueries).toHaveBeenCalledWith({
      objectMetadataNamePlural: 'people',
    });
  });
});
