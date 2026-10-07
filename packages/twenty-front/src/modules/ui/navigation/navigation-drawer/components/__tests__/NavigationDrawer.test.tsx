import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
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

const NavigationDrawerTestProviders = ({
  children,
}: {
  children: ReactNode;
}) => (
  <I18nProvider i18n={i18n}>
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter>{children}</MemoryRouter>
    </JotaiProvider>
  </I18nProvider>
);

const NavigationDrawerPage = ({
  hasPageHeader,
}: {
  hasPageHeader: boolean;
}) => (
  <>
    <NavigationDrawer />
    {hasPageHeader && <PageHeaderExpandButton />}
    <button type="button">Page action</button>
  </>
);

const renderNavigationDrawerPage = ({
  hasPageHeader,
}: {
  hasPageHeader: boolean;
}) => {
  resetJotaiStore();
  jotaiStore.set(isNavigationDrawerExpandedState.atom, true);

  return render(<NavigationDrawerPage hasPageHeader={hasPageHeader} />, {
    wrapper: NavigationDrawerTestProviders,
  });
};

describe('NavigationDrawer', () => {
  it('moves focus to the expand button when the keyboard collapses the drawer from its resize separator', async () => {
    renderNavigationDrawerPage({ hasPageHeader: true });

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
    renderNavigationDrawerPage({ hasPageHeader: true });
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

  it('does not steal focus when the expand button mounts after the keyboard collapse', async () => {
    const { rerender } = renderNavigationDrawerPage({ hasPageHeader: false });
    const pageActionButton = screen.getByRole('button', {
      name: 'Page action',
    });

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    pageActionButton.focus();
    rerender(<NavigationDrawerPage hasPageHeader />);

    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).not.toHaveFocus();
    expect(pageActionButton).toHaveFocus();
  });
});
