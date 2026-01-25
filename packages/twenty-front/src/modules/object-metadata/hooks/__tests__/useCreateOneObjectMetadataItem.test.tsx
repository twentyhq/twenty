import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';

import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import {
  findManyViewsQuery,
  query,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useCreateOneObjectMetadataItem';

import { expectSuccessfulMetadataRequestResult } from '@/object-metadata/hooks/__tests__/utils/expect-metadata-request-status.util';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { mockedUserData } from '~/testing/mock-data/users';
import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '@/object-metadata/hooks/__mocks__/useFindManyObjectMetadataItems';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: vi.fn(() => ({
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
    result: vi.fn(() => ({
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
    result: vi.fn(() => ({
      data: findManyObjectMetadataItemsResponseData,
    })),
  },
  {
    request: {
      query: findManyViewsQuery,
      variables: {},
    },
    result: vi.fn(() => ({
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

const Wrapper = getTestMetadataAndApolloMocksWrapper({
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
      expectSuccessfulMetadataRequestResult(res);
      expect(res.response).toEqual({ data: { createOneObject: responseData } });
    });
  });
});
