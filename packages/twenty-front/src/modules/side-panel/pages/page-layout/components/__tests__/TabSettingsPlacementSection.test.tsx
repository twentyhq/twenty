import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { SingleWidgetTabSettingsContent } from '@/side-panel/pages/page-layout/components/SingleWidgetTabSettingsContent';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

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

const renderTabSettings = (
  tabType: 'regular' | 'single-widget',
  isPinned: boolean,
) => {
  const store = createStore();
  const callbacks = {
    onSetAsPinned: jest.fn(),
    onUnpin: jest.fn(),
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onDuplicate: jest.fn(),
    onResetToDefault: jest.fn(),
    onDelete: jest.fn(),
  };
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
  },
);
