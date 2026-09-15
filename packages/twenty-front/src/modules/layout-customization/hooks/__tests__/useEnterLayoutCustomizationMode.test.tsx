import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: jest.fn(),
  }),
}));
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueWarningSnackBar: jest.fn(),
  }),
}));

const mockUseHasPermissionFlag = useHasPermissionFlag as jest.Mock;

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useEnterLayoutCustomizationMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false and not enable customization mode when user lacks LAYOUTS permission', () => {
    mockUseHasPermissionFlag.mockReturnValue(false);
    const store = createStore();
    const wrapper = getWrapper(store);

    const { result } = renderHook(() => useEnterLayoutCustomizationMode(), {
      wrapper,
    });

    const success = result.current.enterLayoutCustomizationMode();

    expect(success).toBe(false);
    expect(store.get(isLayoutCustomizationModeEnabledState.atom)).toBe(false);
  });

  it('should return true and enable customization mode when user has LAYOUTS permission', () => {
    mockUseHasPermissionFlag.mockReturnValue(true);
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
      current: [],
      draft: [],
      status: 'up-to-date',
    });

    const { result } = renderHook(() => useEnterLayoutCustomizationMode(), {
      wrapper,
    });

    const success = result.current.enterLayoutCustomizationMode();

    expect(success).toBe(true);
    expect(store.get(isLayoutCustomizationModeEnabledState.atom)).toBe(true);
  });
});
