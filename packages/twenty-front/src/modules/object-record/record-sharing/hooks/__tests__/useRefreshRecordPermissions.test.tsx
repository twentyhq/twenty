import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';
import { recordPermissionsFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsFamilySelector';
import { type GetRecordPermissionsQuery } from '~/generated-metadata/graphql';

const mockQuery = jest.fn();
const mockClient = { query: mockQuery };
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => mockClient,
}));
const target = { objectMetadataId: 'object', recordId: 'record' };
const permissions = {
  canRead: true,
  canUpdate: true,
  canDelete: false,
  canSoftDelete: false,
};
const response = (canUpdate = true) => ({
  data: {
    recordPermissions: [
      { ...target, permissions: { ...permissions, canUpdate } },
    ],
  },
});
const deferred = () => {
  let resolve!: (value: { data: GetRecordPermissionsQuery }) => void;
  const promise = new Promise<{ data: GetRecordPermissionsQuery }>(
    (resolvePromise) => {
      resolve = resolvePromise;
    },
  );
  return { promise, resolve };
};
const setup = () => {
  const store = createStore();
  store.set(currentWorkspaceState.atom, { id: 'workspace' } as never);
  store.set(currentWorkspaceMemberState.atom, { id: 'member' } as never);
  store.set(currentUserWorkspaceState.atom, null);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result, rerender } = renderHook(useRefreshRecordPermissions, {
    wrapper,
  });
  const read = () =>
    store.get(recordPermissionsFamilySelector.selectorFamily(target));
  return { store, result, rerender, read };
};

describe('Viewer-scoped record permissions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loads permissions separately and keeps the refresh callback stable', async () => {
    const { result, rerender, read } = setup();
    mockQuery.mockResolvedValue(response());
    const refresh = result.current.refreshRecordPermissions;
    rerender();
    expect(result.current.refreshRecordPermissions).toBe(refresh);
    await act(async () => {
      await refresh([target]);
    });
    expect(read()).toEqual(permissions);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: { targets: [target] },
      }),
    );
  });

  it('deduplicates targets and bounds every network request to 100 records', async () => {
    const { result } = setup();
    mockQuery.mockResolvedValue({ data: { recordPermissions: [] } });
    const targets = Array.from({ length: 201 }, (_, index) => ({
      ...target,
      recordId: String(index),
    }));
    await act(async () => {
      await result.current.refreshRecordPermissions([...targets, ...targets]);
    });
    expect(
      mockQuery.mock.calls.map(([options]) => options.variables.targets.length),
    ).toEqual([100, 100, 1]);
  });

  it('cannot restore a revoked permission from an older response', async () => {
    const { result, read } = setup();
    const older = deferred();
    mockQuery
      .mockReturnValueOnce(older.promise)
      .mockResolvedValueOnce(response(false));
    const first = result.current.refreshRecordPermissions([target]);
    await act(async () => {
      await result.current.refreshRecordPermissions([target]);
    });
    expect(read()?.canUpdate).toBe(false);
    await act(async () => {
      older.resolve(response());
      await first;
    });
    expect(read()?.canUpdate).toBe(false);
  });

  it.each(['workspace', 'member', 'role'] as const)(
    'ignores in-flight responses after a %s change',
    async (change) => {
      const { result, store, read } = setup();
      const pending = deferred();
      mockQuery.mockReturnValue(pending.promise);
      const request = result.current.refreshRecordPermissions([target]);
      if (change === 'workspace')
        store.set(currentWorkspaceState.atom, { id: 'other' } as never);
      if (change === 'member')
        store.set(currentWorkspaceMemberState.atom, { id: 'other' } as never);
      if (change === 'role')
        store.set(currentUserWorkspaceState.atom, {
          objectsPermissions: [],
        } as never);
      await act(async () => {
        pending.resolve(response());
        await request;
      });
      expect(read()).toBeUndefined();
    },
  );

  it('clears stale write access while refreshing and stays unavailable after failure', async () => {
    const { result, read } = setup();
    mockQuery
      .mockResolvedValueOnce(response())
      .mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      await result.current.refreshRecordPermissions([target]);
    });
    expect(read()?.canUpdate).toBe(true);
    const request = result.current.refreshRecordPermissions([target]);
    expect(read()).toBeUndefined();
    await act(async () => {
      await request;
    });
    expect(read()).toBeUndefined();
  });

  it('does not reuse permissions across accounts or after a role change', async () => {
    const { result, read, store } = setup();
    mockQuery.mockResolvedValue(response());
    await act(async () => {
      await result.current.refreshRecordPermissions([target]);
    });
    store.set(currentWorkspaceMemberState.atom, { id: 'other' } as never);
    expect(read()).toBeUndefined();
    store.set(currentWorkspaceMemberState.atom, { id: 'member' } as never);
    store.set(currentUserWorkspaceState.atom, {
      objectsPermissions: [],
    } as never);
    expect(read()).toBeUndefined();
  });
});
