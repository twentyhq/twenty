import { renderHook } from '@testing-library/react';

import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import {
  PermissionFlagType,
  ViewVisibility,
} from '~/generated-metadata/graphql';

const mockUseGetCurrentViewOnly = jest.fn();
const mockUseHasPermissionFlag = jest.fn();

jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => mockUseGetCurrentViewOnly(),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: (permissionFlag: PermissionFlagType) =>
    mockUseHasPermissionFlag(permissionFlag),
}));

describe('useCanPersistViewChanges', () => {
  const baseView = {
    id: 'view-id',
    visibility: ViewVisibility.WORKSPACE,
    isLocked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHasPermissionFlag.mockReturnValue(false);
    mockUseGetCurrentViewOnly.mockReturnValue({ currentView: baseView });
  });

  it('returns false when there is no current view', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({ currentView: undefined });

    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(result.current.canPersistChanges).toBe(false);
  });

  it('allows users with views permission to persist locked workspace views', () => {
    mockUseHasPermissionFlag.mockReturnValue(true);
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: {
        ...baseView,
        isLocked: true,
      },
    });

    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(mockUseHasPermissionFlag).toHaveBeenCalledWith(
      PermissionFlagType.VIEWS,
    );
    expect(result.current.canPersistChanges).toBe(true);
  });

  it('denies regular users persisting locked workspace views', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: {
        ...baseView,
        isLocked: true,
      },
    });

    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(result.current.canPersistChanges).toBe(false);
    expect(result.current.persistChangesUnavailableReason).toBe(
      'This workspace view is locked. You can temporarily change filters, but only admins can update the shared view.',
    );
  });

  it('allows regular users to persist unlocked unlisted views', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: {
        ...baseView,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(result.current.canPersistChanges).toBe(true);
  });

  it('denies regular users persisting locked unlisted views', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: {
        ...baseView,
        visibility: ViewVisibility.UNLISTED,
        isLocked: true,
      },
    });

    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(result.current.canPersistChanges).toBe(false);
    expect(result.current.persistChangesUnavailableReason).toBe(
      'This workspace view is locked. You can temporarily change filters, but only admins can update the shared view.',
    );
  });

  it('denies regular users persisting unlocked workspace views', () => {
    const { result } = renderHook(() => useCanPersistViewChanges());

    expect(result.current.canPersistChanges).toBe(false);
    expect(result.current.persistChangesUnavailableReason).toBe(
      'Workspace views require manage views permission.',
    );
  });
});
