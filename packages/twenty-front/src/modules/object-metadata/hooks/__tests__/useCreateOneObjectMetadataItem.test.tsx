import { act, renderHook } from '@testing-library/react';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';

import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  findManyViewsQuery,
  query,
  responseData,
  variables,
} from '../__mocks__/useCreateOneObjectMetadataItem';

import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '../__mocks__/useFindManyObjectMetadataItems';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { mockedUserData } from '~/testing/mock-data/users';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createOneObject: responseData,
      },
    })),
  },
  {
    request: {
      query: GET_CURRENT_USER,
      variables: {},
    },
    result: jest.fn(() => ({
      data: {
        currentUser: mockedUserData,
      },
    })),
  },
  {
    request: {
      query: findManyObjectMetadataItemsQuery,
      variables: {},
    },
    result: jest.fn(() => ({
      data: findManyObjectMetadataItemsResponseData,
    })),
  },
  {
    request: {
      query: findManyViewsQuery,
      variables: {},
    },
    result: jest.fn(() => ({
      data: {
        views: {
          __typename: 'ViewConnection',
          totalCount: 0,
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: false,
            startCursor: '',
            endCursor: '',
          },
          edges: [],
        },
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateOneObjectMetadataItem', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(() => useCreateOneObjectMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.createOneObjectMetadataItem({
        icon: 'IconPlus',
        labelPlural: 'View Filters',
        labelSingular: 'View Filter',
        namePlural: 'viewFilters',
        nameSingular: 'viewFilter',
      });

      expect(res.data).toEqual({ createOneObject: responseData });
    });
  });
});
