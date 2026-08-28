import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

const PAGE_LAYOUT_ID = 'page-layout';
const TAB_LIST_ID = 'tab-list';
const TABS = ['Tasks', 'Notes', 'Files'].map((title, index) =>
  makeTab(title, [], index),
);
const mockNavigate = jest.fn();
const mockOpenTabSettings = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockCloseDropdown = jest.fn();
let mockIsInEditMode = true;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@dnd-kit/react', () => ({ useDragDropMonitor: jest.fn() }));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => mockIsInEditMode,
}));

jest.mock('@/page-layout/hooks/useOpenPageLayoutTabSettings', () => ({
  useOpenPageLayoutTabSettings: () => ({
    openTabSettings: mockOpenTabSettings,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: mockCloseDropdown }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({ openDropdown: jest.fn() }),
}));

jest.mock('@/ui/utilities/pointer-event/hooks/useClickOutsideListener', () => ({
  useClickOutsideListener: () => ({ toggleClickOutside: jest.fn() }),
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/ui/layout/tab-list/hooks/useTabListMeasurements', () => ({
  useTabListMeasurements: ({
    visibleTabs,
  }: {
    visibleTabs: SingleTabProps[];
  }) => ({
    visibleTabCount: 2,
    hiddenTabs: visibleTabs.slice(2),
    hiddenTabsCount: 1,
    hasHiddenTabs: true,
    onTabWidthChange: jest.fn(),
    onContainerWidthChange: jest.fn(),
    onMoreButtonWidthChange: jest.fn(),
    onAddButtonWidthChange: jest.fn(),
  }),
}));

jest.mock('@/ui/utilities/dimensions/components/NodeDimension', () => ({
  NodeDimension: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@/ui/layout/tab-list/components/TabListHiddenMeasurements', () => ({
  TabListHiddenMeasurements: () => null,
}));

jest.mock(
  '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect',
  () => ({
    TabListFromUrlOptionalEffect: () => null,
  }),
);

jest.mock('@/page-layout/components/PageLayoutTabListVisibleTabs', () => ({
  PageLayoutTabListVisibleTabs: ({
    visibleTabs,
    visibleTabCount,
    activeTabId,
    onSelectTab,
  }: {
    visibleTabs: SingleTabProps[];
    visibleTabCount: number;
    activeTabId: string | null;
    onSelectTab: (tabId: string) => void;
  }) => (
    <>
      {visibleTabs.slice(0, visibleTabCount).map((tab) => (
        <button
          key={tab.id}
          aria-pressed={activeTabId === tab.id}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.title}
        </button>
      ))}
    </>
  ),
}));

jest.mock(
  '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown',
  () => ({
    PageLayoutTabListReorderableOverflowDropdown: ({
      hiddenTabs,
      activeTabId,
      onSelect,
    }: {
      hiddenTabs: SingleTabProps[];
      activeTabId: string | null;
      onSelect: (tabId: string) => void;
    }) => (
      <div aria-label="More tabs">
        {hiddenTabs.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTabId === tab.id}
            onClick={() => onSelect(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
    ),
  }),
);

const renderTabList = ({
  pageLayoutType = PageLayoutType.RECORD_PAGE,
  settingsTabId = null,
  isInSidePanel = false,
}: {
  pageLayoutType?: PageLayoutType;
  settingsTabId?: string | null;
  isInSidePanel?: boolean;
} = {}) => {
  const store = createStore();
  const settingsTabAtom =
    pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    });
  store.set(
    activeTabIdComponentState.atomFamily({ instanceId: TAB_LIST_ID }),
    'Tasks',
  );
  store.set(settingsTabAtom, settingsTabId);
  mockOpenTabSettings.mockImplementation((tabId: string) => {
    store.set(settingsTabAtom, tabId);
  });
  mockCloseSidePanelMenu.mockImplementation(() => {
    store.set(settingsTabAtom, null);
  });

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <PageLayoutComponentInstanceContext.Provider
          value={{ instanceId: PAGE_LAYOUT_ID }}
        >
          <PageLayoutTabList
            tabs={TABS}
            componentInstanceId={TAB_LIST_ID}
            pageLayoutType={pageLayoutType}
            behaveAsLinks={false}
            isReorderEnabled
            isInSidePanel={isInSidePanel}
          />
        </PageLayoutComponentInstanceContext.Provider>
      </I18nProvider>
    </Provider>,
  );
};

describe('PageLayoutTabList selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInEditMode = true;
  });

  it.each(['Notes', 'Files'])(
    'navigates to %s first and opens settings on a second click',
    async (title) => {
      renderTabList();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: title }));

      expect(screen.getByRole('button', { name: title })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(mockNavigate).toHaveBeenCalledWith(`#${title}`);
      expect(mockOpenTabSettings).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: title }));

      expect(mockOpenTabSettings).toHaveBeenCalledTimes(1);
      expect(mockOpenTabSettings).toHaveBeenCalledWith(title);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['Notes', 'Files'])(
    'closes previous tab settings when navigating to %s',
    async (title) => {
      renderTabList({ settingsTabId: 'Tasks' });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: title }));

      expect(screen.getByRole('button', { name: title })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(mockOpenTabSettings).not.toHaveBeenCalled();
      expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: title }));

      expect(mockOpenTabSettings).toHaveBeenCalledWith(title);
    },
  );

  it('opens settings immediately when clicking the current tab', async () => {
    renderTabList();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Tasks' }));

    expect(mockOpenTabSettings).toHaveBeenCalledWith('Tasks');
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it.each([PageLayoutType.DASHBOARD, PageLayoutType.STANDALONE_PAGE])(
    'preserves settings-follow-selection behavior for %s layouts',
    async (pageLayoutType) => {
      renderTabList({ pageLayoutType, settingsTabId: 'Tasks' });

      await userEvent
        .setup()
        .click(screen.getByRole('button', { name: 'Notes' }));

      expect(mockOpenTabSettings).toHaveBeenCalledWith('Notes');
      expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
    },
  );

  it.each(['Notes', 'Files'])(
    'does not open or close settings for %s outside edit mode',
    async (title) => {
      mockIsInEditMode = false;
      renderTabList({ settingsTabId: 'Tasks' });
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: title }));
      await user.click(screen.getByRole('button', { name: title }));

      expect(mockOpenTabSettings).not.toHaveBeenCalled();
      expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
    },
  );

  it('switches an embedded record tab without changing the page URL', async () => {
    renderTabList({ isInSidePanel: true });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Notes' }));
    expect(screen.getByRole('button', { name: 'Notes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOpenTabSettings).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Notes' }));
    expect(mockOpenTabSettings).toHaveBeenCalledWith('Notes');
  });
});
