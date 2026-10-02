import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const RECORD_TARGET = { objectMetadataId: 'note', recordId: 'record' };

const PERMISSIONS = {
  __typename: 'RecordPermissionsDTO',
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canSoftDelete: true,
};

const SHARING = {
  __typename: 'RecordSharingDTO',
  sharingMode: 'PRIVATE',
  canManageSharing: true,
  permissions: PERMISSIONS,
  generalAccessLevel: 'NONE',
  defaultGeneralAccessLevel: 'NONE',
  hasManagedGeneralAccess: false,
  shares: [],
  roles: [],
};

const SHARED_WITH_MEMBER = {
  ...SHARING,
  permissions: { ...PERMISSIONS, canDelete: false },
  shares: [
    {
      __typename: 'RecordSharingGrantDTO',
      id: 'grant',
      principalId: 'member',
      principalType: 'WORKSPACE_MEMBER',
      principalRoleId: 'member-role',
      accessLevel: 'READ',
      rowCause: 'MANUAL',
    },
  ],
};

const MUTATION_FIELD_BY_OPERATION_NAME: Record<string, string> = {
  SetRecordShare: 'setRecordShare',
  SetRecordGeneralAccess: 'setRecordGeneralAccess',
  RemoveRecordShare: 'removeRecordShare',
};

const createHarness = () => {
  const request = jest.fn(
    (
      operationName: string | undefined,
      _variables: Record<string, unknown>,
    ) => {
      const mutationField =
        MUTATION_FIELD_BY_OPERATION_NAME[operationName ?? ''];

      return mutationField === undefined
        ? { recordSharing: SHARING }
        : { [mutationField]: SHARED_WITH_MEMBER };
    },
  );
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          try {
            observer.next({
              data: request(operation.operationName, operation.variables),
            });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }),
    ),
  });
  const store = createStore();
  store.set(currentWorkspaceState.atom, { id: 'workspace' } as never);
  store.set(currentWorkspaceMemberState.atom, { id: 'viewer' } as never);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </JotaiProvider>
  );
  const readStoredPermissions = () =>
    store.get(
      recordPermissionsFamilyState.atomFamily({
        ...RECORD_TARGET,
        workspaceId: 'workspace',
        workspaceMemberId: 'viewer',
      }),
    )?.permissions;
  return { request, wrapper, readStoredPermissions };
};

const renderRecordSharing = (
  wrapper: ReturnType<typeof createHarness>['wrapper'],
) =>
  renderHook(() => useRecordSharing({ recordTarget: RECORD_TARGET }), {
    wrapper,
  });

describe('useRecordSharing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  it('updates the audience and the record permissions from the mutation without another request', async () => {
    const { request, wrapper, readStoredPermissions } = createHarness();
    const { result } = renderRecordSharing(wrapper);
    await waitFor(() =>
      expect(result.current.sharing?.canManageSharing).toBe(true),
    );
    await act(async () => {
      await result.current.setShare({
        principal: { workspaceMemberId: 'member' },
        accessLevel: RecordShareAccessLevel.READ,
      });
    });
    expect(request.mock.calls.map(([operationName]) => operationName)).toEqual([
      'GetRecordSharing',
      'SetRecordShare',
    ]);
    expect(request).toHaveBeenLastCalledWith('SetRecordShare', {
      target: RECORD_TARGET,
      principal: { workspaceMemberId: 'member' },
      accessLevel: RecordShareAccessLevel.READ,
    });
    expect(result.current.sharing?.shares).toEqual([
      expect.objectContaining({ principalId: 'member' }),
    ]);
    expect(readStoredPermissions()).toEqual(SHARED_WITH_MEMBER.permissions);
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('sends general access and removals through their own mutations', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderRecordSharing(wrapper);
    await waitFor(() =>
      expect(result.current.sharing?.canManageSharing).toBe(true),
    );
    await act(async () => {
      await result.current.setGeneralAccess(RecordShareAccessLevel.NONE);
    });
    expect(request).toHaveBeenLastCalledWith('SetRecordGeneralAccess', {
      target: RECORD_TARGET,
      accessLevel: RecordShareAccessLevel.NONE,
    });
    await act(async () => {
      await result.current.removeShare({ principal: { roleId: 'role' } });
    });
    expect(request).toHaveBeenLastCalledWith('RemoveRecordShare', {
      target: RECORD_TARGET,
      principal: { roleId: 'role' },
    });
  });

  it('reports a rejected mutation without changing the saved audience', async () => {
    const { request, wrapper, readStoredPermissions } = createHarness();
    const { result } = renderRecordSharing(wrapper);
    await waitFor(() =>
      expect(result.current.sharing?.canManageSharing).toBe(true),
    );
    request.mockImplementationOnce(() => {
      throw new Error('Save failed');
    });
    await act(async () => {
      await result.current.setShare({
        principal: { workspaceMemberId: 'member' },
        accessLevel: RecordShareAccessLevel.READ,
      });
    });
    expect(result.current.sharing?.shares).toEqual([]);
    expect(readStoredPermissions()).toBeUndefined();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
  });

  it('does not poll for changes', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderRecordSharing(wrapper);
    await waitFor(() =>
      expect(result.current.sharing?.canManageSharing).toBe(true),
    );
    await act(async () => {
      jest.advanceTimersByTime(120_000);
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('refreshes on focus and removes the listener on unmount', async () => {
    const { request, wrapper } = createHarness();
    const TestSharingRefresh = () => {
      const { refetch } = useRecordSharing({ recordTarget: RECORD_TARGET });
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

  it('retains the loaded sharing on a refresh error so retry stays reachable', async () => {
    const { request, wrapper } = createHarness();
    const { result } = renderRecordSharing(wrapper);
    await waitFor(() =>
      expect(result.current.sharing?.canManageSharing).toBe(true),
    );
    request.mockImplementationOnce(() => {
      throw new Error('Network unavailable');
    });
    await act(async () => {
      await result.current.refetch().catch(() => {});
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.sharing?.canManageSharing).toBe(true);
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.sharing?.canManageSharing).toBe(true);
  });
});
