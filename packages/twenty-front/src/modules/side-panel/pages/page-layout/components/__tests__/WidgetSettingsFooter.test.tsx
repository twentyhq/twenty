import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const mockDuplicateWidget = jest.fn();
const mockDeleteWidget = jest.fn();

jest.mock('@/page-layout/hooks/useDuplicatePageLayoutWidget', () => ({
  useDuplicatePageLayoutWidget: () => ({
    duplicateWidget: mockDuplicateWidget,
  }),
}));

jest.mock('@/page-layout/hooks/useDeletePageLayoutWidget', () => ({
  useDeletePageLayoutWidget: () => ({
    deletePageLayoutWidget: mockDeleteWidget,
  }),
}));

const BackgroundClickOutsideEffect = ({
  onOutside,
}: {
  onOutside: () => void;
}) => {
  useListenClickOutside({
    listenerId: 'background-board',
    excludedClickOutsideIds: [SIDE_PANEL_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onOutside,
  });

  return null;
};

const renderFooter = ({
  onOutside = jest.fn(),
}: { onOutside?: () => void } = {}) => {
  const store = createStore();
  store.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: 'layout',
    }),
    'widget',
  );
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
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <BackgroundClickOutsideEffect onOutside={onOutside} />
        <div data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}>
          <WidgetSettingsFooter pageLayoutId="layout" />
        </div>
      </Provider>
    </I18nProvider>,
  );
  return { store, user: userEvent.setup() };
};

describe('WidgetSettingsFooter', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['Control', 'Meta'])(
    'toggles with %s+O from the side panel and from the focused menu',
    async (modifier) => {
      const { store, user } = renderFooter();
      await user.keyboard(`{${modifier}>}o{/${modifier}}`);
      const duplicateAction = await screen.findByRole('menuitem', {
        name: 'Duplicate widget',
      });
      await waitFor(() => expect(duplicateAction).toHaveFocus());
      expect(
        store.get(focusStackState.atom).at(-1)?.globalHotkeysConfig
          .enableGlobalHotkeysWithModifiers,
      ).toBe(true);

      await user.keyboard(`{${modifier}>}o{/${modifier}}`);
      await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(store.get(focusStackState.atom)).toHaveLength(1),
      );
      expect(mockDuplicateWidget).not.toHaveBeenCalled();
    },
  );

  it('preserves background selection while clicking a portaled footer action', async () => {
    const onOutside = jest.fn();
    const { user } = renderFooter({ onOutside });
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Duplicate widget' }),
    );

    expect(mockDuplicateWidget).toHaveBeenCalledWith('widget');
    expect(onOutside).not.toHaveBeenCalled();

    await user.click(document.body);
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('executes keyboard and pointer actions once, closes, and restores the trigger', async () => {
    const { user } = renderFooter();
    const trigger = screen.getByRole('button', { name: 'Options' });
    await user.click(trigger);
    await screen.findByRole('menuitem', { name: 'Duplicate widget' });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(mockDeleteWidget).toHaveBeenCalledTimes(1);
    expect(mockDeleteWidget).toHaveBeenCalledWith('widget');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.click(trigger);
    await user.click(
      await screen.findByRole('menuitem', { name: 'Duplicate widget' }),
    );
    expect(mockDuplicateWidget).toHaveBeenCalledTimes(1);
    expect(mockDuplicateWidget).toHaveBeenCalledWith('widget');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });
});
