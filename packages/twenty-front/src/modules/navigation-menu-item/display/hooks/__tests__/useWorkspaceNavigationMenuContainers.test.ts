import { renderHook } from '@testing-library/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

jest.mock('@/navigation-menu-item/display/hooks/useNavigationMenuItemsData');
jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability',
  () => ({
    useNavigationMenuBuiltInSectionAvailability: () => ({
      isBuiltInSectionAvailable: () => true,
    }),
  }),
);
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

const UNNAMED_TAB: NavigationMenuItem = {
  id: 'unnamed-tab',
  type: NavigationMenuItemType.TAB,
  name: null,
  position: 0,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('useWorkspaceNavigationMenuContainers', () => {
  it('names an unnamed tab "Tab"', () => {
    jest.mocked(useNavigationMenuItemsData).mockReturnValue({
      workspaceNavigationMenuItems: [UNNAMED_TAB],
    } as ReturnType<typeof useNavigationMenuItemsData>);

    const { result } = renderHook(() =>
      useWorkspaceNavigationMenuContainers({
        type: NavigationMenuItemType.TAB,
        containerId: null,
      }),
    );

    expect(result.current.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'unnamed-tab', name: 'Tab' },
    ]);
  });
});
