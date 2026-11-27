import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { NavigationMenuTabContent } from '@/navigation-menu-item/display/containers/components/NavigationMenuTabContent';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const mockEnterLayoutCustomizationMode = jest.fn();

jest.mock(
  '@/layout-customization/hooks/useEnterLayoutCustomizationMode',
  () => ({
    useEnterLayoutCustomizationMode: () => ({
      enterLayoutCustomizationMode: mockEnterLayoutCustomizationMode,
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems',
);
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);
jest.mock(
  '@/navigation-menu-item/display/containers/components/NavigationMenuContainerContent',
  () => ({ NavigationMenuContainerContent: () => null }),
);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const SALES_SECTION: NamedNavigationMenuItem = {
  id: 'sales-section-id',
  type: NavigationMenuItemType.SECTION,
  name: 'Sales',
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const renderTabContent = (permissionFlags: PermissionFlagType[]) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <NavigationMenuTabContent containerId="sales-tab-id" />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('NavigationMenuTabContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigationMenuContainerItems).mockReturnValue({
      topLevelItems: [],
      folderChildrenById: new Map(),
    });
    jest.mocked(useWorkspaceNavigationMenuContainers).mockReturnValue([]);
  });

  it('offers Customize tab on an empty tab', async () => {
    renderTabContent([PermissionFlagType.LAYOUTS]);

    await userEvent.click(screen.getByText('Customize tab'));

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalledTimes(1);
  });

  it('does not offer Customize tab once the tab has a section', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([SALES_SECTION]);

    renderTabContent([PermissionFlagType.LAYOUTS]);

    expect(screen.queryByText('Customize tab')).not.toBeInTheDocument();
  });

  it('does not offer Customize tab without the layouts permission', () => {
    renderTabContent([]);

    expect(screen.queryByText('Customize tab')).not.toBeInTheDocument();
  });
});
