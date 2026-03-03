import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import {
  currentUserWorkspaceState,
  type CurrentUserWorkspace,
} from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  twoFactorAuthenticationMethodSummary: [],
};

const getWrapper =
  ({
    withUserWorkspace = false,
  }: {
    withUserWorkspace?: boolean;
  } = {}) =>
  ({ children }: { children: ReactNode }) => {
    // Initialize state in the store before rendering
    if (withUserWorkspace) {
      jotaiStore.set(currentUserWorkspaceState.atom, mockUserWorkspace);
    } else {
      jotaiStore.set(currentUserWorkspaceState.atom, null);
    }
    jotaiStore.set(isAppEffectRedirectEnabledState.atom, false);

    return <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;
  };

describe('useRefreshObjectMetadataItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ data: responseData });
    // Reset jotai store state
    jotaiStore.set(objectMetadataItemsState.atom, []);
    jotaiStore.set(isAppEffectRedirectEnabledState.atom, true);
    jotaiStore.set(currentUserWorkspaceState.atom, null);
  });

  it('should not populate items when user workspace is not available', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useAtomStateValue(
          objectMetadataItemsState,
        );
        return {
          ...hook,
          items: objectMetadataItems,
        };
      },
      { wrapper: getWrapper({ withUserWorkspace: false }) },
    );

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    // Without user workspace, replaceObjectMetadataItemIfDifferent returns early
    expect(result.current.items).toEqual([]);
  });

  it('should fetch and enrich items when user workspace is available', async () => {
    const { result } = renderHook(
      () => {
        const hook = useRefreshObjectMetadataItems();
        const objectMetadataItems = useAtomStateValue(
          objectMetadataItemsState,
        );
        return {
          ...hook,
          items: objectMetadataItems,
        };
      },
      { wrapper: getWrapper({ withUserWorkspace: true }) },
    );

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    // Items should have readable/updatable fields after enrichment
    expect(result.current.items[0].readableFields).toBeDefined();
  });

  it('should use network-only fetch policy by default', async () => {
    const { result } = renderHook(
      () => useRefreshObjectMetadataItems(),
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

  it('should use specified fetch policy when provided', async () => {
    const { result } = renderHook(
      () => useRefreshObjectMetadataItems('cache-first'),
      { wrapper: getWrapper({ withUserWorkspace: true }) },
    );

    await act(async () => {
      await result.current.refreshObjectMetadataItems();
    });

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'cache-first',
      }),
    );
  });
});
