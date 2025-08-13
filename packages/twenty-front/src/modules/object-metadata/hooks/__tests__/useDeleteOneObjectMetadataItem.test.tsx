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

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '../__mocks__/useFindManyObjectMetadataItems';
import { mockedUserData } from '~/testing/mock-data/users';

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

      expect(res.data).toEqual({ deleteOneObject: responseData });
    });
  });
});
