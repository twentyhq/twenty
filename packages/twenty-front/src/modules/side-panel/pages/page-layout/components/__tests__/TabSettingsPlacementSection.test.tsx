import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { SingleWidgetTabSettingsContent } from '@/side-panel/pages/page-layout/components/SingleWidgetTabSettingsContent';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { PageLayoutType } from '~/generated-metadata/graphql';

jest.mock('@/page-layout/hooks/useDuplicatePageLayoutTab', () => ({
  useDuplicatePageLayoutTab: () => ({ duplicateTab: jest.fn() }),
}));

jest.mock('@/page-layout/hooks/useResetPageLayoutTabToDefault', () => ({
  useResetPageLayoutTabToDefault: () => ({
    resetPageLayoutTabToDefault: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: () => null,
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/command-menu/components/CommandMenuItemDropdown', () => ({
  CommandMenuItemDropdown: ({ label }: { label: string }) => (
    <span>{label}</span>
  ),
}));

jest.mock(
  '@/side-panel/pages/page-layout/components/dropdown-content/SingleWidgetTabVisibilityDropdownContent',
  () => ({ SingleWidgetTabVisibilityDropdownContent: () => null }),
);

const createTabSettingsStore = () => {
  const store = createStore();

  store.set(focusStackState.atom, [
    {
      focusId: SIDE_PANEL_FOCUS_ID,
      componentInstance: {
        componentType: FocusComponentType.SIDE_PANEL,
        componentInstanceId: SIDE_PANEL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);

  return store;
};

const CurrentTabLocation = () => {
  const { hash } = useLocation();

  return <output>{hash}</output>;
};

const renderTabSettings = (
  tabType: 'regular' | 'single-widget',
  isPinned: boolean,
) => {
  const store = createTabSettingsStore();
  const callbacks = {
    onSetAsPinned: jest.fn(),
    onUnpin: jest.fn(),
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onDuplicate: jest.fn(),
    onResetToDefault: jest.fn(),
    onDelete: jest.fn(),
  };

  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <JotaiProvider store={store}>
          {tabType === 'regular' ? (
            <RegularTabSettingsContent
              canSetAsPinned={!isPinned}
              canUnpin={isPinned}
              canMoveLeft={!isPinned}
              canMoveRight={true}
              canDelete={true}
              isResetToDefaultDisabled={false}
              onSetAsPinned={callbacks.onSetAsPinned}
              onUnpin={callbacks.onUnpin}
              onMoveLeft={callbacks.onMoveLeft}
              onMoveRight={callbacks.onMoveRight}
              onDuplicate={callbacks.onDuplicate}
              onResetToDefault={callbacks.onResetToDefault}
              onDelete={callbacks.onDelete}
            />
          ) : (
            <SingleWidgetTabSettingsContent
              canSetAsPinned={!isPinned}
              canUnpin={isPinned}
              canMoveLeft={!isPinned}
              canMoveRight={true}
              canDelete={true}
              isResetToDefaultDisabled={false}
              onSetAsPinned={callbacks.onSetAsPinned}
              onUnpin={callbacks.onUnpin}
              onMoveLeft={callbacks.onMoveLeft}
              onMoveRight={callbacks.onMoveRight}
              onResetToDefault={callbacks.onResetToDefault}
              onDelete={callbacks.onDelete}
              pageLayoutId="page-layout-id"
              singleWidget={makeWidget('widget-id', 0)}
            />
          )}
        </JotaiProvider>
      </I18nProvider>
    </MemoryRouter>,
  );

  return callbacks;
};

describe.each(['regular', 'single-widget'] as const)(
  '%s tab placement',
  (tabType) => {
    it('puts pinning before movement and follows that order with the keyboard', async () => {
      const user = userEvent.setup();
      const { onSetAsPinned, onMoveLeft, onMoveRight } = renderTabSettings(
        tabType,
        false,
      );

      expect(screen.getByText('Placement')).toBeVisible();
      expect(
        screen
          .getAllByText(/^(Pin tab|Move left|Move right)$/)
          .map((item) => item.textContent),
      ).toEqual(['Pin tab', 'Move left', 'Move right']);

      await user.keyboard('{Enter}{ArrowDown}{Enter}{ArrowDown}{Enter}');

      expect(onSetAsPinned).toHaveBeenCalledTimes(1);
      expect(onMoveLeft).toHaveBeenCalledTimes(1);
      expect(onMoveRight).toHaveBeenCalledTimes(1);
    });

    it('offers unpinning for a pinned tab and omits unavailable movement', async () => {
      const user = userEvent.setup();
      const { onUnpin, onMoveRight } = renderTabSettings(tabType, true);

      expect(screen.queryByText('Pin tab')).not.toBeInTheDocument();
      expect(screen.queryByText('Move left')).not.toBeInTheDocument();

      await user.click(screen.getByText('Unpin tab'));
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onUnpin).toHaveBeenCalledTimes(1);
      expect(onMoveRight).toHaveBeenCalledTimes(1);
    });

    it.each(['', '#timeline'])(
      'keeps the newly unpinned tab selected when the initial URL hash is "%s"',
      async (initialHash) => {
        const user = userEvent.setup();
        const store = createTabSettingsStore();
        const pageLayoutId = 'page-layout-id';
        const recordId = 'record-id';
        const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
          pageLayoutId,
          layoutType: PageLayoutType.RECORD_PAGE,
          targetRecordIdentifier: {
            id: recordId,
            targetObjectNameSingular: 'company',
          },
        });
        const pageLayoutDraftAtom = pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        });
        const activeTabIdAtom = activeTabIdComponentState.atomFamily({
          instanceId: tabListInstanceId,
        });

        store.set(
          pageLayoutDraftAtom,
          makeDraft([
            makeTab(
              'home',
              tabType === 'single-widget'
                ? [makeWidget('home-widget', 0, 'home')]
                : [],
              0,
            ),
            makeTab('timeline', [], 1),
          ]),
        );
        store.set(activeTabIdAtom, 'timeline');
        store.set(
          pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          'home',
        );

        render(
          <MemoryRouter
            initialEntries={[`/object/company/${recordId}${initialHash}`]}
          >
            <I18nProvider i18n={i18n}>
              <JotaiProvider store={store}>
                <TabListComponentInstanceContext.Provider
                  value={{ instanceId: tabListInstanceId }}
                >
                  <TabListFromUrlOptionalEffect
                    tabListIds={['home', 'timeline']}
                    isInSidePanel={false}
                  />
                  <SidePanelPageLayoutTabSettingsContent
                    pageLayoutId={pageLayoutId}
                    recordId={recordId}
                  />
                  <CurrentTabLocation />
                </TabListComponentInstanceContext.Provider>
              </JotaiProvider>
            </I18nProvider>
          </MemoryRouter>,
        );

        await user.click(screen.getByText('Unpin tab'));

        expect(store.get(pageLayoutDraftAtom).isFirstTabPinned).toBe(false);
        expect(store.get(activeTabIdAtom)).toBe('home');
        expect(screen.getByRole('status')).toHaveTextContent('#home');
      },
    );
  },
);
