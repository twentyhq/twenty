import { ReactNode } from 'react';
import { MockedProvider, MockLink } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';

import {} from '../__mocks__/ApolloMetadataClientProvider';
import {
  query,
  responseData,
  variables,
} from '../__mocks__/useDeleteOneObjectMetadataItem';

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
];

const mockLink = new MockLink(mocks);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false} link={mockLink}>
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
