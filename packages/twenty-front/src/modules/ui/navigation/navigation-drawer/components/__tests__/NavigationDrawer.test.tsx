import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawerHeader',
  () => ({
    NavigationDrawerHeader: () => null,
  }),
);

const PageHeaderExpandButton = () => {
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );

  return isNavigationDrawerExpanded ? null : (
    <NavigationDrawerCollapseButton direction="right" />
  );
};

const renderNavigationDrawerWithPageHeader = () => {
  resetJotaiStore();
  jotaiStore.set(isNavigationDrawerExpandedState.atom, true);

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter>
          <NavigationDrawer />
          <PageHeaderExpandButton />
          <button type="button">Page action</button>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('NavigationDrawer', () => {
  it('moves focus to the expand button when the keyboard collapses the drawer from its resize separator', async () => {
    renderNavigationDrawerWithPageHeader();

    await userEvent.tab();

    expect(
      screen.getByRole('separator', { name: 'Resize navigation drawer' }),
    ).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(jotaiStore.get(isNavigationDrawerExpandedState.atom)).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toHaveFocus();
  });

  it('keeps focus where it was when the resize separator is clicked', async () => {
    renderNavigationDrawerWithPageHeader();
    const pageActionButton = screen.getByRole('button', {
      name: 'Page action',
    });

    pageActionButton.focus();
    await userEvent.click(
      screen.getByRole('separator', { name: 'Resize navigation drawer' }),
    );

    expect(jotaiStore.get(isNavigationDrawerExpandedState.atom)).toBe(false);
    expect(pageActionButton).toHaveFocus();
  });
});
