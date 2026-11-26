import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

const mockEnterLayoutCustomizationMode = jest.fn();

jest.mock(
  '@/layout-customization/hooks/useEnterLayoutCustomizationMode',
  () => ({
    useEnterLayoutCustomizationMode: () => ({
      enterLayoutCustomizationMode: mockEnterLayoutCustomizationMode,
    }),
  }),
);

jest.mock('@/navigation/hooks/useCanCustomizeSidebar', () => ({
  useCanCustomizeSidebar: () => true,
}));

jest.mock('@/navigation/hooks/useIsSettingsDrawer', () => ({
  useIsSettingsDrawer: () => false,
}));

jest.mock(
  '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab',
  () => ({ useActiveNavigationMenuTab: () => undefined }),
);

const SALES_SECTION: NamedNavigationMenuItem = {
  id: 'sales-section-id',
  type: NavigationMenuItemType.SECTION,
  name: 'Sales',
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const AGENTS_SECTION: NamedNavigationMenuItem = {
  ...SALES_SECTION,
  id: 'agents-section-id',
  name: '',
  builtInSectionKey: 'aiAgents',
  position: 1,
};

jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
  () => ({
    useWorkspaceNavigationMenuContainers: () => [SALES_SECTION, AGENTS_SECTION],
  }),
);

const renderSidebar = () => {
  const store = createStore();

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <MainNavigationDrawerContextMenu>
            <div>Search</div>
            <div data-navigation-menu-section-id={SALES_SECTION.id}>
              <span>Sales</span>
              <a href="/objects/companies">Companies</a>
            </div>
            <div data-navigation-menu-section-id={AGENTS_SECTION.id}>
              <span>Agents</span>
            </div>
          </MainNavigationDrawerContextMenu>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

  return store;
};

describe('MainNavigationDrawerContextMenu', () => {
  beforeEach(() => {
    mockEnterLayoutCustomizationMode.mockClear();
  });

  it('offers to add an item to the right-clicked section', async () => {
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Sales'));

    expect(await screen.findByText('Add item to Sales')).toBeVisible();
    expect(screen.getByText('Add section')).toBeVisible();
    expect(screen.getByText('Customize sidebar')).toBeVisible();
  });

  it('only offers Add item inside a custom section', async () => {
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Agents'));

    expect(await screen.findByText('Add section')).toBeVisible();
    expect(screen.queryByText(/Add item to/)).not.toBeInTheDocument();
  });

  it('collapses every section of the tab', async () => {
    const store = renderSidebar();

    fireEvent.contextMenu(screen.getByText('Search'));
    await userEvent.click(await screen.findByText('Collapse all sections'));

    expect(
      store.get(
        isNavigationSectionOpenFamilyState.atomFamily(
          `navigation-menu-section-${SALES_SECTION.id}`,
        ),
      ),
    ).toBe(false);
    expect(
      store.get(isNavigationSectionOpenFamilyState.atomFamily('AiAgents')),
    ).toBe(false);
  });

  it('leaves the browser menu on links', () => {
    renderSidebar();

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Companies'),
    );

    expect(isBrowserMenuShown).toBe(true);
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });
});
