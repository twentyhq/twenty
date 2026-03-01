import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import {
  currentUserWorkspaceState,
  type CurrentUserWorkspace,
} from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { responseData } from '@/object-metadata/hooks/__mocks__/useFindManyObjectMetadataItems';

const mockQuery = jest.fn().mockResolvedValue({ data: responseData });

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useApolloClient: () => ({
      query: mockQuery,
    }),
  };
});

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';

const mockUserWorkspace: CurrentUserWorkspace = {
  objectsPermissions: [],
  permissionFlags: [],
  twoFactorAuthenticationMethodSummary: {
    hasTotp: false,
    hasBackupCodes: false,
  },
};

const getWrapper =
  ({
    withUserWorkspace = false,
    isLoading = true,
  }: {
    withUserWorkspace?: boolean;
    isLoading?: boolean;
  } = {}) =>
  ({ children }: { children: ReactNode }) => (
    <RecoilRoot
      initializeState={({ set }) => {
        set(shouldAppBeLoadingState, isLoading);
        set(isAppEffectRedirectEnabledState, false);
        if (withUserWorkspace) {
          set(currentUserWorkspaceState, mockUserWorkspace);
        }
      }}
    >
      {children}
    </RecoilRoot>
  );

describe('useRefreshObjectMetadataItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ data: responseData });
  });

  it('should fetch and store raw metadata items without permissions', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
        const shouldAppBeLoading = useRecoilValue(shouldAppBeLoadingState);
        return { ...hook, items, shouldLoad };
      },
      { wrapper: getWrapper({ withUserWorkspace: false }) },
    );

    expect(result.current.shouldLoad).toBe(true);

    await act(async () => {
      await result.current.fetchAndStoreRawObjectMetadataItems();
    });

    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    // Without permissions, all fields should be readable/updatable
    const item = result.current.items[0];
    expect(item.readableFields).toEqual(item.fields);
    expect(item.updatableFields).toEqual(item.fields);
    expect(result.current.shouldLoad).toBe(false);
  });

  it('should not enrich when user workspace is not available', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
        return { ...hook, items };
      },
      { wrapper: getWrapper({ withUserWorkspace: false }) },
    );

    await act(async () => {
      await result.current.fetchAndStoreRawObjectMetadataItems();
    });

    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    const itemsBefore = [...result.current.items];

    // enrichWithPermissions should be a no-op without user workspace
    act(() => {
      result.current.enrichWithPermissions();
    });

    expect(result.current.items).toEqual(itemsBefore);
  });

  it('should enrich items with permissions when user workspace is available', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
        return { ...hook, items };
      },
      { wrapper: getWrapper({ withUserWorkspace: true }) },
    );

    await act(async () => {
      await result.current.fetchAndStoreRawObjectMetadataItems();
    });

    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.enrichWithPermissions();
    });

    // Items should still be present after enrichment
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.items[0].readableFields).toBeDefined();
  });

  it('should use refreshObjectMetadataItems when user workspace is available', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
        const shouldAppBeLoading = useRecoilValue(shouldAppBeLoadingState);
        return { ...hook, items, shouldLoad };
      },
      { wrapper: getWrapper({ withUserWorkspace: true }) },
    );

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    expect(result.current.shouldLoad).toBe(false);
  });

  it('should use cache-first fetch policy by default', async () => {
    const { result } = renderHook(() => useRefreshObjectMetadataItems(), {
      wrapper: getWrapper({ withUserWorkspace: true }),
    });

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'cache-first',
      }),
    );
  });

  it('should use specified fetch policy when provided', async () => {
    const { result } = renderHook(
      () => useRefreshObjectMetadataItems('network-only'),
      { wrapper: getWrapper({ withUserWorkspace: true }) },
    );

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'network-only',
      }),
    );
  });
});
