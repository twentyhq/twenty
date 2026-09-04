import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutTabListNewTabDropdownContent } from '@/page-layout/components/PageLayoutTabListNewTabDropdownContent';
import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { usePageLayoutAddTabStrategy } from '@/page-layout/hooks/usePageLayoutAddTabStrategy';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const TAB_LIST_ID = getTabListInstanceIdFromPageLayoutId(
  PAGE_LAYOUT_TEST_INSTANCE_ID,
);
const mockNavigatePageLayoutSidePanel = jest.fn();
const mockCloseDropdown = jest.fn();
const mockSelectTab = jest.fn();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: mockCloseDropdown }),
}));

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({ dropdownComponents }: { dropdownComponents: ReactNode }) => (
    <>{dropdownComponents}</>
  ),
}));

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell',
  () => ({
    DragDropItemSortableCell: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
  }),
);

jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget',
  () => ({
    DragDropItemDropTarget: () => null,
  }),
);

const TabSettingsControls = () => {
  const addTabStrategy = usePageLayoutAddTabStrategy({
    pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    tabListInstanceId: TAB_LIST_ID,
  });

  if (!isDefined(addTabStrategy)) {
    return null;
  }

  return (
    <>
      <PageLayoutTabListNewTabDropdownContent
        onCreate={addTabStrategy.onCreate}
        dropdownId="new-tab"
      />
      <PageLayoutTabListReorderableOverflowDropdown
        dropdownId="more-tabs"
        hiddenTabs={[{ id: 'hidden-tab', title: 'Hidden tab' }]}
        hiddenTabsCount={1}
        isActiveTabHidden={false}
        activeTabId="active-tab"
        onSelect={mockSelectTab}
        visibleTabCount={1}
        onClose={mockCloseDropdown}
        pageLayoutType={PageLayoutType.RECORD_PAGE}
      />
    </>
  );
};

describe('tab settings navigation during a closing panel', () => {
  beforeEach(() => jest.resetAllMocks());

  it.each(['create', 'reactivate', 'overflow'])(
    'keeps the selected tab when opening settings through %s',
    async (action) => {
      const store = createStore();
      const draftAtom = pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
      const settingsTabAtom =
        pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        });
      const activeTabAtom = activeTabIdComponentState.atomFamily({
        instanceId: TAB_LIST_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
      store.set(isLayoutCustomizationModeEnabledState.atom, true);
      store.set(activeTabAtom, 'active-tab');
      store.set(settingsTabAtom, 'active-tab');
      store.set(
        draftAtom,
        makeDraft([
          makeTab('active-tab', []),
          makeTab('disabled-tab', [], 1, undefined, {
            title: 'Disabled tab',
            isActive: false,
          }),
          makeTab('hidden-tab', [], 2),
        ]),
      );
      mockNavigatePageLayoutSidePanel.mockImplementationOnce(() => {
        store.set(settingsTabAtom, null);
      });

      render(
        <PageLayoutTestWrapper
          store={store}
          layoutType={PageLayoutType.RECORD_PAGE}
        >
          <I18nProvider i18n={i18n}>
            <MemoryRouter>
              <TabSettingsControls />
            </MemoryRouter>
          </I18nProvider>
        </PageLayoutTestWrapper>,
      );

      const user = userEvent.setup({ skipHover: true });

      if (action === 'overflow') {
        const tab = screen.getByRole('option', { name: 'Hidden tab' });
        await user.hover(tab);
        await user.click(within(tab).getByRole('button'));
      } else {
        await user.click(
          screen.getByText(action === 'create' ? 'Empty tab' : 'Disabled tab'),
        );
      }

      const tabs = store.get(draftAtom).tabs;
      const expectedTabId =
        action === 'create'
          ? tabs.find((tab) => tab.title === 'Untitled')?.id
          : action === 'reactivate'
            ? 'disabled-tab'
            : 'hidden-tab';
      expect(expectedTabId).toEqual(expect.any(String));
      expect(store.get(settingsTabAtom)).toBe(expectedTabId);
      expect(tabs.find((tab) => tab.id === expectedTabId)?.isActive).toBe(true);
      expect(store.get(activeTabAtom)).toBe(
        action === 'overflow' ? 'active-tab' : expectedTabId,
      );
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith(
        expect.objectContaining({
          sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        }),
      );
      expect(mockCloseDropdown).toHaveBeenCalledTimes(1);
      expect(mockSelectTab).not.toHaveBeenCalled();
      if (action === 'create') {
        expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith(
          expect.objectContaining({ focusTitleInput: true }),
        );
      }
    },
  );
});
