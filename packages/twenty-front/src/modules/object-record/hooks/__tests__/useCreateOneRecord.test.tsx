import { InMemoryCache } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';

import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  CACHED_PEOPLE_CONNECTION,
  CACHED_PEOPLE_CONNECTION_QUERY,
} from '@/object-record/hooks/__mocks__/cachedPeopleConnection';
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

  it('leaves cached connections unchanged when the creation fails', async () => {
    const cache = new InMemoryCache();

    cache.writeQuery({
      query: CACHED_PEOPLE_CONNECTION_QUERY,
      data: CACHED_PEOPLE_CONNECTION,
    });

    const { result } = renderHook(
      () =>
        useCreateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          apolloMocks: [
            {
              request: {
                query,
                variables: { input: { ...input, id: PERSON_ID } },
              },
              result: { errors: [{ message: 'Creation rejected' }] },
            },
          ],
          cache,
        }),
      },
    );

    await act(async () => {
      await expect(result.current.createOneRecord(input)).rejects.toThrow(
        'Creation rejected',
      );
    });

    expect(cache.readQuery({ query: CACHED_PEOPLE_CONNECTION_QUERY })).toEqual(
      CACHED_PEOPLE_CONNECTION,
    );
  });
});
