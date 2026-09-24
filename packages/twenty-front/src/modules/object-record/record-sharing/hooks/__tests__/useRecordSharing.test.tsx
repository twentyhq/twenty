import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const createHarness = () => {
  const sharing = {
    __typename: 'RecordSharingDTO',
    viewerAccessLevel: 'FULL',
    permissions: {
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canSoftDelete: true,
    },
    isEnabled: true,
    hasInheritedAccess: false,
    shares: [],
    roles: [],
  };
  const request = jest.fn((operationName: string | undefined) =>
    operationName === 'SetRecordShare'
      ? {
          setRecordShare: {
            ...sharing,
            shares: [
              {
                __typename: 'RecordSharingGrantDTO',
                id: 'grant',
                principalId: 'member',
                principalType: 'WORKSPACE_MEMBER',
                accessLevel: 'READ',
                rowCause: 'MANUAL',
              },
            ],
          },
        }
      : { recordSharing: sharing },
  );
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          try {
            observer.next({ data: request(operation.operationName) });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }),
    ),
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return { request, wrapper };
};

describe('useRecordSharing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  it('updates the audience from the successful mutation without another request', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderHook(
      () =>
        useRecordSharing({
          recordTarget: { objectMetadataId: 'note', recordId: 'record' },
          isOpen: false,
        }),
      {
        wrapper,
      },
    );
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    await act(async () => {
      await result.current.setShare({
        principal: { workspaceMemberId: 'member' },
        enabled: true,
      });
    });
    expect(request).toHaveBeenCalledTimes(2);
    expect(result.current.sharing?.shares).toEqual([
      expect.objectContaining({ principalId: 'member' }),
    ]);
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('reports a rejected mutation without changing the saved audience', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderHook(
      () =>
        useRecordSharing({
          recordTarget: { objectMetadataId: 'note', recordId: 'record' },
          isOpen: false,
        }),
      {
        wrapper,
      },
    );
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    request.mockImplementationOnce(() => {
      throw new Error('Save failed');
    });
    await act(async () => {
      await result.current.setShare({
        principal: { workspaceMemberId: 'member' },
        enabled: true,
      });
    });
    expect(result.current.sharing?.shares).toEqual([]);
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
  });

  it('fetches availability once while closed and polls only while open', async () => {
    const { request, wrapper } = createHarness();
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useRecordSharing({
          recordTarget: { objectMetadataId: 'note', recordId: 'record' },
          isOpen: isOpen,
        }),
      { wrapper, initialProps: { isOpen: false } },
    );
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(1);
    rerender({ isOpen: true });
    await act(async () => {
      jest.advanceTimersByTime(30_001);
    });
    expect(request).toHaveBeenCalledTimes(2);
    rerender({ isOpen: false });
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('refreshes on focus and removes the listener on unmount', async () => {
    const { request, wrapper } = createHarness();
    const TestSharingRefresh = () => {
      const { refetch } = useRecordSharing({
        recordTarget: { objectMetadataId: 'note', recordId: 'record' },
        isOpen: false,
      });
      return <RecordSharingRefreshEffect refetch={refetch} />;
    };
    const { unmount } = render(<TestSharingRefresh />, { wrapper });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(request).toHaveBeenCalledTimes(2);
    unmount();
    window.dispatchEvent(new Event('focus'));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('retains confirmed availability on a refresh error so retry stays reachable', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderHook(
      () =>
        useRecordSharing({
          recordTarget: { objectMetadataId: 'note', recordId: 'record' },
          isOpen: false,
        }),
      {
        wrapper,
      },
    );
    await waitFor(() => expect(result.current.sharing?.isEnabled).toBe(true));
    request.mockImplementationOnce(() => {
      throw new Error('Network unavailable');
    });
    await act(async () => {
      await result.current.refetch().catch(() => {});
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.sharing?.isEnabled).toBe(true);
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.sharing?.isEnabled).toBe(true);
  });
});
