import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import {
  currentUserWorkspaceState,
  type CurrentUserWorkspace,
} from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';

const mockFetchAndStoreRaw = jest.fn();
const mockEnrichWithPermissions = jest.fn();
const mockRefreshObjectMetadataItems = jest.fn();
const mockBackgroundFetchRaw = jest.fn();
const mockLoadMockedObjectMetadataItems = jest.fn();

jest.mock('@/object-metadata/hooks/useRefreshObjectMetadataItems', () => ({
  useRefreshObjectMetadataItems: jest.fn((fetchPolicy) => {
    if (fetchPolicy === 'network-only') {
      return {
        fetchAndStoreRawObjectMetadataItems: mockBackgroundFetchRaw,
        enrichWithPermissions: jest.fn(),
        refreshObjectMetadataItems: mockRefreshObjectMetadataItems,
      };
    }
    return {
      fetchAndStoreRawObjectMetadataItems: mockFetchAndStoreRaw,
      enrichWithPermissions: mockEnrichWithPermissions,
      refreshObjectMetadataItems: mockRefreshObjectMetadataItems,
    };
  }),
}));

jest.mock('@/object-metadata/hooks/useLoadMockedObjectMetadataItems', () => ({
  useLoadMockedObjectMetadataItems: jest.fn(() => ({
    loadMockedObjectMetadataItems: mockLoadMockedObjectMetadataItems,
  })),
}));

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';

const mockTokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'test-token',
    expiresAt: new Date().toISOString(),
  },
  refreshToken: {
    token: 'test-refresh',
    expiresAt: new Date().toISOString(),
  },
};

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
    hasToken = false,
    hasUserWorkspace = false,
  }: {
    hasToken?: boolean;
    hasUserWorkspace?: boolean;
  } = {}) =>
  ({ children }: { children: ReactNode }) => (
    <RecoilRoot
      initializeState={({ set }) => {
        if (hasToken) {
          set(tokenPairState, mockTokenPair);
        }
        if (hasUserWorkspace) {
          set(currentUserWorkspaceState, mockUserWorkspace);
        }
      }}
    >
      {children}
    </RecoilRoot>
  );

// Helper to render the effect
const renderEffect = (options: {
  hasToken?: boolean;
  hasUserWorkspace?: boolean;
}) => {
  return renderHook(
    () => {
      const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
      const shouldAppBeLoading = useRecoilValue(shouldAppBeLoadingState);
      return { items, shouldAppBeLoading };
    },
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <>
          {getWrapper(options)({
            children: (
              <>
                {children}
                <ObjectMetadataItemsLoadEffect />
              </>
            ),
          })}
        </>
      ),
    },
  );
};

describe('ObjectMetadataItemsLoadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchAndStoreRaw.mockResolvedValue([]);
    mockBackgroundFetchRaw.mockResolvedValue([]);
    mockLoadMockedObjectMetadataItems.mockResolvedValue(undefined);
  });

  it('should load mocked metadata when no token is present', async () => {
    renderEffect({ hasToken: false });

    await waitFor(() => {
      expect(mockLoadMockedObjectMetadataItems).toHaveBeenCalledTimes(1);
    });

    expect(mockFetchAndStoreRaw).not.toHaveBeenCalled();
  });

  it('should fetch raw metadata when token is present (Phase 1)', async () => {
    renderEffect({ hasToken: true });

    await waitFor(() => {
      expect(mockFetchAndStoreRaw).toHaveBeenCalledTimes(1);
    });

    expect(mockLoadMockedObjectMetadataItems).not.toHaveBeenCalled();
  });

  it('should trigger background refresh after initial fetch', async () => {
    renderEffect({ hasToken: true });

    await waitFor(() => {
      expect(mockFetchAndStoreRaw).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockBackgroundFetchRaw).toHaveBeenCalledTimes(1);
    });
  });

  it('should enrich with permissions when user workspace data is available (Phase 2)', async () => {
    renderEffect({ hasToken: true, hasUserWorkspace: true });

    await waitFor(() => {
      expect(mockEnrichWithPermissions).toHaveBeenCalledTimes(1);
    });
  });

  it('should not enrich when user workspace data is not available', async () => {
    renderEffect({ hasToken: true, hasUserWorkspace: false });

    await waitFor(() => {
      expect(mockFetchAndStoreRaw).toHaveBeenCalledTimes(1);
    });

    expect(mockEnrichWithPermissions).not.toHaveBeenCalled();
  });

  it('should fall back to mocked items when fetch fails', async () => {
    mockFetchAndStoreRaw.mockRejectedValueOnce(new Error('Network error'));

    renderEffect({ hasToken: true });

    await waitFor(() => {
      expect(mockLoadMockedObjectMetadataItems).toHaveBeenCalledTimes(1);
    });
  });
});
