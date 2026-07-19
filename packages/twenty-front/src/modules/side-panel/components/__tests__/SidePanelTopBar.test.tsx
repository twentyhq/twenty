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
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
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

const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelContextChips', () => ({
  useSidePanelContextChips: () => ({ contextChips: [] }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
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
  store.set(sidePanelPageInfoState.atom, {
    title: sidePanelNavigationStack.at(-1)?.pageTitle,
    Icon: sidePanelNavigationStack.at(-1)?.pageIcon,
    instanceId: sidePanelNavigationStack.at(-1)?.pageId ?? '',
  });
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
    mockCloseSidePanelMenu.mockClear();
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

  it('clears search with Escape without navigating', () => {
    const { store } = renderSidePanelCommandMenu();

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    fireEvent.change(input, {
      target: { value: 'company' },
    });

    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(store.get(sidePanelSearchState.atom)).toBe('');
    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it('closes the side panel with Escape from an empty root search', () => {
    renderSidePanelCommandMenu();

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });

  it('does not navigate with Backspace while search has text', () => {
    const { store } = renderSidePanelCommandMenu(
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

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    fireEvent.change(input, {
      target: { value: 'company' },
    });

    fireEvent.keyDown(input, {
      key: 'Backspace',
      code: 'Backspace',
    });

    expect(store.get(sidePanelSearchState.atom)).toBe('company');
    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(2);
  });

  it('goes back with Backspace from an empty search when side panel history exists', () => {
    const { store } = renderSidePanelCommandMenu(
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

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    fireEvent.keyDown(input, {
      key: 'Backspace',
      code: 'Backspace',
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
    expect(store.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.CommandMenuDisplay,
    );
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it('does not close the root side panel with Backspace from an empty search', () => {
    const { store } = renderSidePanelCommandMenu();

    const input = screen.getByTestId(SIDE_PANEL_FOCUS_ID);

    fireEvent.keyDown(input, {
      key: 'Backspace',
      code: 'Backspace',
    });

    expect(store.get(sidePanelNavigationStackState.atom)).toHaveLength(1);
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
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

  it('shows the close button on mobile when there is no back button to dismiss the panel', () => {
    mockIsMobile = true;

    renderSidePanelCommandMenu();

    expect(
      screen.getByRole('button', { name: 'Close side panel' }),
    ).toBeInTheDocument();
  });

  it('hides the close button on mobile when a back button is available', () => {
    mockIsMobile = true;

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
      screen.queryByRole('button', { name: 'Close side panel' }),
    ).not.toBeInTheDocument();
  });
});
