import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';

import {
  findManyViewsQuery,
  query,
  responseData,
  variables,
} from '../__mocks__/useCreateOneObjectMetadataItem';

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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

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
