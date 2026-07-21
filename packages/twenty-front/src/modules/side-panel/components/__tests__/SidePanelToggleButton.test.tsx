import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderSidePanelButtonClickOutsideId';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

const mockAppTooltip = jest.fn();

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => false,
  getOsControlSymbol: () => '⌘',
}));

jest.mock('twenty-ui/surfaces', () => ({
  ...jest.requireActual('twenty-ui/surfaces'),
  AppTooltip: (props: { content: string }) => {
    mockAppTooltip(props);

    return null;
  },
}));

const renderSidePanelToggleButton = ({
  isSidePanelOpened = false,
  sidePanelPage = SidePanelPages.CommandMenuDisplay,
  sidePanelNavigationStack = [],
  sidePanelSearch = '',
  sidePanelSearchObjectFilter = null,
}: {
  isSidePanelOpened?: boolean;
  sidePanelPage?: SidePanelPages;
  sidePanelNavigationStack?: Array<{
    page: SidePanelPages;
    pageTitle: string;
    pageIcon: typeof IconDotsVertical;
    pageId: string;
  }>;
  sidePanelSearch?: string;
  sidePanelSearchObjectFilter?: string | null;
} = {}) => {
  const store = createStore();

  store.set(isSidePanelOpenedState.atom, isSidePanelOpened);
  store.set(sidePanelPageState.atom, sidePanelPage);
  store.set(sidePanelNavigationStackState.atom, sidePanelNavigationStack);
  store.set(sidePanelSearchState.atom, sidePanelSearch);
  store.set(sidePanelSearchObjectFilterState.atom, sidePanelSearchObjectFilter);

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <SidePanelToggleButton />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

describe('SidePanelToggleButton', () => {
  beforeEach(() => {
    mockAppTooltip.mockClear();
  });

  it('opens the command menu when the side panel is closed', () => {
    const { store } = renderSidePanelToggleButton();

    fireEvent.click(screen.getByTestId('page-header-side-panel-button'));

    expect(store.get(isSidePanelOpenedState.atom)).toBe(true);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
  });

  it('hides the navbar command menu button while the command menu is open', () => {
    renderSidePanelToggleButton({
      isSidePanelOpened: true,
      sidePanelPage: SidePanelPages.CommandMenuDisplay,
      sidePanelNavigationStack: [
        {
          page: SidePanelPages.CommandMenuDisplay,
          pageTitle: 'Command Menu',
          pageIcon: IconDotsVertical,
          pageId: 'command-menu',
        },
      ],
    });

    expect(
      screen.queryByTestId('page-header-side-panel-button'),
    ).not.toBeInTheDocument();
  });

  it('hides the navbar command menu button when the side panel has command-menu history', () => {
    renderSidePanelToggleButton({
      isSidePanelOpened: true,
      sidePanelPage: SidePanelPages.ViewRecord,
      sidePanelNavigationStack: [
        {
          page: SidePanelPages.CommandMenuDisplay,
          pageTitle: 'Command Menu',
          pageIcon: IconDotsVertical,
          pageId: 'command-menu',
        },
        {
          page: SidePanelPages.ViewRecord,
          pageTitle: 'Company',
          pageIcon: IconDotsVertical,
          pageId: 'view-record',
        },
      ],
    });

    expect(
      screen.queryByTestId('page-header-side-panel-button'),
    ).not.toBeInTheDocument();
  });

  it('keeps the navbar command menu button on unrelated side-panel drill-down pages', () => {
    renderSidePanelToggleButton({
      isSidePanelOpened: true,
      sidePanelPage: SidePanelPages.WorkflowStepCreate,
      sidePanelNavigationStack: [
        {
          page: SidePanelPages.WorkflowStepEdit,
          pageTitle: 'Edit step',
          pageIcon: IconDotsVertical,
          pageId: 'workflow-step-edit',
        },
        {
          page: SidePanelPages.WorkflowStepCreate,
          pageTitle: 'Create step',
          pageIcon: IconDotsVertical,
          pageId: 'workflow-step-create',
        },
      ],
    });

    expect(screen.getByTestId('page-header-side-panel-button')).toBeVisible();
  });

  it('shows the command menu keyboard shortcut in the tooltip', () => {
    renderSidePanelToggleButton();

    expect(mockAppTooltip).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Command menu | ⌘K',
      }),
    );
  });

  it('marks the command menu button as a click-outside exclusion', () => {
    renderSidePanelToggleButton();

    expect(
      screen
        .getByTestId('page-header-side-panel-button')
        .closest('[data-click-outside-id]'),
    ).toHaveAttribute(
      'data-click-outside-id',
      PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID,
    );
  });

  it('replaces a directly opened side-panel page with the root command menu', () => {
    const { store } = renderSidePanelToggleButton({
      isSidePanelOpened: true,
      sidePanelPage: SidePanelPages.ViewRecord,
      sidePanelSearch: 'acme',
      sidePanelSearchObjectFilter: 'company',
      sidePanelNavigationStack: [
        {
          page: SidePanelPages.ViewRecord,
          pageTitle: 'Company',
          pageIcon: IconDotsVertical,
          pageId: 'view-record',
        },
      ],
    });

    fireEvent.click(screen.getByTestId('page-header-side-panel-button'));

    expect(store.get(isSidePanelOpenedState.atom)).toBe(true);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(store.get(sidePanelNavigationStackState.atom)).toMatchObject([
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Command Menu',
      },
    ]);
    expect(store.get(sidePanelSearchState.atom)).toBe('');
    expect(store.get(sidePanelSearchObjectFilterState.atom)).toBeNull();
  });
});
