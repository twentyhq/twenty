import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

const openAskAiPage = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage }),
}));

const renderHandoff = ({
  pathname,
  activeTab,
}: {
  pathname: string;
  activeTab: NavigationDrawerActiveTab;
}) => {
  const store = createStore();

  store.set(shouldContinueAiChatInSidePanelState.atom, true);
  store.set(navigationDrawerActiveTabState.atom, activeTab);

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <SidePanelAskAiHandoffEffect onContinueChatFromFullWidth={jest.fn()} />
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe('SidePanelAskAiHandoffEffect', () => {
  beforeEach(() => {
    openAskAiPage.mockClear();
  });

  it('continues the chat in the side panel when leaving it for a record', () => {
    renderHandoff({
      pathname: '/objects/companies',
      activeTab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    });

    expect(openAskAiPage).toHaveBeenCalled();
  });

  it.each([
    ['for the inbox', '/inbox', NAVIGATION_DRAWER_TABS.NAVIGATION_MENU],
    [
      'within the Inbox mode',
      '/objects/companies',
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    ],
  ])('closes the chat when leaving it %s', (_, pathname, activeTab) => {
    const store = renderHandoff({ pathname, activeTab });

    expect(openAskAiPage).not.toHaveBeenCalled();
    expect(store.get(shouldContinueAiChatInSidePanelState.atom)).toBe(false);
  });
});
