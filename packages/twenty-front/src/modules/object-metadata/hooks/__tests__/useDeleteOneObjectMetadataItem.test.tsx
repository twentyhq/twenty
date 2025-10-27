import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';

import {
  query,
  responseData,
  variables,
} from '../__mocks__/useDeleteOneObjectMetadataItem';

import { jestExpectSuccessfulMetadataRequestResult } from '@/object-metadata/hooks/__tests__/utils/jest-expect-metadata-request-status.util';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { FIND_ALL_CORE_VIEWS } from '@/views/graphql/queries/findAllCoreViews';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockedCoreViewsData } from '~/testing/mock-data/views';
import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '../__mocks__/useFindManyObjectMetadataItems';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        deleteOneObject: responseData,
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
      query: FIND_ALL_CORE_VIEWS,
      variables: {},
    },
    result: jest.fn(() => ({
      data: {
        getCoreViews: mockedCoreViewsData,
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
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useDeleteOneObjectMetadataItem', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(() => useDeleteOneObjectMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res =
        await result.current.deleteOneObjectMetadataItem('idToDelete');

      jestExpectSuccessfulMetadataRequestResult(res);
      expect(res.response).toEqual({ deleteOneObject: responseData });
    });
  });
});
