import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { useRightDrawerEmailThread } from '../useRightDrawerEmailThread';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  __esModule: true,
  useFindManyRecords: jest.fn(),
}));

describe('useRightDrawerEmailThread', () => {
  it('should return correct values', async () => {
    const mockMessages = [
      { id: '1', text: 'Message 1' },
      { id: '2', text: 'Message 2' },
    ];
    const mockFetchMoreRecords = jest.fn();
    (useFindManyRecords as jest.Mock).mockReturnValue({
      records: mockMessages,
      loading: false,
      fetchMoreRecords: mockFetchMoreRecords,
    });

    const { result } = renderHook(() => useRightDrawerEmailThread(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]} addTypename={false}>
          <RecoilRoot>{children}</RecoilRoot>
        </MockedProvider>
      ),
    });

    expect(result.current.thread).toBeDefined();
    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.fetchMoreMessages).toBeInstanceOf(Function);
  });
});
