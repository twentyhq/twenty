import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil } from 'twenty-ui/icon';

const mockNavigateSidePanel = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({ navigateSidePanel: mockNavigateSidePanel }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

describe('CommandMenuItemEditButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens and closes editing from the keyboard without submitting its form', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const onSubmit = jest.fn((event) => event.preventDefault());

    store.set(isLayoutCustomizationModeEnabledState.atom, true);

    render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <form onSubmit={onSubmit}>
            <CommandMenuItemEditButton />
          </form>
        </I18nProvider>
      </Provider>,
    );

    const button = screen.getByRole('button', { name: 'Edit actions' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({ page: SidePanelPages.CommandMenuEdit }),
    );

    act(() => {
      store.set(isSidePanelOpenedState.atom, true);
      store.set(sidePanelNavigationStackState.atom, [
        {
          page: SidePanelPages.CommandMenuEdit,
          pageId: 'edit-actions',
          pageTitle: 'Edit actions',
          pageIcon: IconPencil,
        },
      ]);
    });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides editing when layout customization is disabled', () => {
    render(
      <Provider store={createStore()}>
        <I18nProvider i18n={i18n}>
          <CommandMenuItemEditButton />
        </I18nProvider>
      </Provider>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
