import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { PageFocusId } from '@/types/PageFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

jest.mock('@/side-panel/components/SidePanelTopBarInputFocusEffect', () => ({
  SidePanelTopBarInputFocusEffect: () => null,
}));

jest.mock('@/side-panel/components/SidePanelTopBarRightCornerIcon', () => ({
  SidePanelTopBarRightCornerIcon: () => null,
}));

jest.mock('@/side-panel/hooks/useSidePanelContextChips', () => ({
  useSidePanelContextChips: () => ({ contextChips: [] }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: jest.fn(),
  }),
}));

let mockIsMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockIsMobile,
}));

const recordIndexFocusItem = {
  focusId: PageFocusId.RecordIndex,
  componentInstance: {
    componentType: FocusComponentType.PAGE,
    componentInstanceId: PageFocusId.RecordIndex,
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysWithModifiers: true,
    enableGlobalHotkeysConflictingWithKeyboard: true,
  },
};

const createSidePanelTopBarStore = ({
  sidePanelPage = SidePanelPages.CommandMenuDisplay,
  sidePanelNavigationStack = [
    {
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      pageId: 'command-menu',
    },
  ],
}: {
  sidePanelPage?: SidePanelPages;
  sidePanelNavigationStack?: Array<{
    page: SidePanelPages;
    pageTitle: string;
    pageIcon: typeof IconDotsVertical;
    pageId: string;
  }>;
} = {}) => {
  const store = createStore();

  store.set(isSidePanelOpenedState.atom, true);
  store.set(sidePanelPageState.atom, sidePanelPage);
  store.set(sidePanelNavigationStackState.atom, sidePanelNavigationStack);
  store.set(focusStackState.atom, [recordIndexFocusItem]);

  return store;
};

const renderSidePanelCommandMenu = (store = createSidePanelTopBarStore()) => {
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <SidePanelTopBar />
        <SidePanelList selectableItemIds={['first-item', 'second-item']}>
          <SelectableListItem itemId="first-item">
            First item
          </SelectableListItem>
          <SelectableListItem itemId="second-item">
            Second item
          </SelectableListItem>
        </SidePanelList>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

describe('SidePanelTopBar', () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it('keeps the command menu search input focused while arrowing through items', async () => {
    const { store } = renderSidePanelCommandMenu();

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    input.focus();

    await waitFor(() => {
      expect(
        store.get(
          selectedItemIdComponentState.atomFamily({
            instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
          }),
        ),
      ).toBe('first-item');
    });

    fireEvent.keyDown(input, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    await waitFor(() => {
      expect(
        store.get(
          selectedItemIdComponentState.atomFamily({
            instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
          }),
        ),
      ).toBe('second-item');
    });

    expect(document.activeElement).toBe(input);
    expect(store.get(focusStackState.atom).at(-1)).toMatchObject({
      focusId: SIDE_PANEL_FOCUS_ID,
      componentInstance: {
        componentType: FocusComponentType.TEXT_INPUT,
        componentInstanceId: SIDE_PANEL_FOCUS_ID,
      },
    });
  });

  it('shows only the close button on the root command menu', () => {
    renderSidePanelCommandMenu();

    expect(
      screen.getByRole('button', { name: 'Close side panel' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  });

  it('does not show the close button on mobile', () => {
    mockIsMobile = true;

    renderSidePanelCommandMenu();

    expect(
      screen.queryByRole('button', { name: 'Close side panel' }),
    ).not.toBeInTheDocument();
  });

  it('renders the close button after the command menu content', () => {
    renderSidePanelCommandMenu();

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);
    const closeButton = screen.getByRole('button', {
      name: 'Close side panel',
    });

    expect(
      Boolean(
        input.compareDocumentPosition(closeButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });

  it('shows both back and close buttons for command menu subpages', () => {
    renderSidePanelCommandMenu(
      createSidePanelTopBarStore({
        sidePanelPage: SidePanelPages.SearchRecords,
        sidePanelNavigationStack: [
          {
            page: SidePanelPages.CommandMenuDisplay,
            pageTitle: 'Command Menu',
            pageIcon: IconDotsVertical,
            pageId: 'command-menu',
          },
          {
            page: SidePanelPages.SearchRecords,
            pageTitle: 'Search',
            pageIcon: IconDotsVertical,
            pageId: 'search-records',
          },
        ],
      }),
    );

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close side panel' }),
    ).toBeInTheDocument();
  });

  it('shows only the close button when a page was opened directly', () => {
    renderSidePanelCommandMenu(
      createSidePanelTopBarStore({
        sidePanelPage: SidePanelPages.ViewRecord,
        sidePanelNavigationStack: [
          {
            page: SidePanelPages.ViewRecord,
            pageTitle: 'Company',
            pageIcon: IconDotsVertical,
            pageId: 'view-record',
          },
        ],
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Close side panel' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  });
});
