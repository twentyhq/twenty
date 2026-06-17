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
import { IconDotsVertical } from 'twenty-ui-deprecated/display';

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

jest.mock('twenty-ui-deprecated/utilities', () => ({
  useIsMobile: () => true,
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

const createSidePanelTopBarStore = () => {
  const store = createStore();

  store.set(isSidePanelOpenedState.atom, true);
  store.set(sidePanelPageState.atom, SidePanelPages.CommandMenuDisplay);
  store.set(sidePanelNavigationStackState.atom, [
    {
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      pageId: 'command-menu',
    },
  ]);
  store.set(focusStackState.atom, [recordIndexFocusItem]);

  return store;
};

const renderSidePanelCommandMenu = () => {
  const store = createSidePanelTopBarStore();

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
});
