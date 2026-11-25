import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsMobile } from 'twenty-ui/utilities';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

jest.mock('@/navigation/hooks/useIsSettingsDrawer');
jest.mock('@/workspace/hooks/useIsFeatureEnabled');
jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: jest.fn(),
}));

jest.mock('@/getting-started/components/GettingStartedSidebarCard', () => ({
  GettingStartedSidebarCard: () => null,
}));

jest.mock('@/navigation/components/MainNavigationDrawerContent', () => ({
  MainNavigationDrawerContent: () => <div>Main content</div>,
}));

jest.mock('@/navigation/components/MainNavigationDrawerContextMenu', () => ({
  MainNavigationDrawerContextMenu: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/navigation/components/MainNavigationDrawerTabSwitcher', () => ({
  MainNavigationDrawerTabSwitcher: () => (
    <button type="button">Navigation modes</button>
  ),
}));

jest.mock('@/navigation/components/MainNavigationDrawerSearchField', () => ({
  MainNavigationDrawerSearchField: () => (
    <button type="button">Search or ask...</button>
  ),
}));

jest.mock('@/navigation/components/SettingsNavigationDrawerContent', () => ({
  SettingsNavigationDrawerContent: () => <div>Settings content</div>,
}));

jest.mock('@/navigation/components/NavigationDrawerModeTransition', () => ({
  NavigationDrawerModeTransition: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawer',
  () => ({
    NavigationDrawer: ({ children }: { children: ReactNode }) => (
      <aside>{children}</aside>
    ),
  }),
);

jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent',
  () => ({
    NavigationDrawerFixedContent: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
  }),
);

describe('AppNavigationDrawer', () => {
  beforeEach(() => {
    jest.mocked(useIsMobile).mockReturnValue(false);
    jest.mocked(useIsSettingsDrawer).mockReturnValue(false);
    jest.mocked(useIsFeatureEnabled).mockReturnValue(false);
  });

  it('keeps the mode switcher mounted when the drawer content changes', () => {
    const { rerender } = render(<AppNavigationDrawer />);
    const modeSwitcher = screen.getByRole('button', {
      name: 'Navigation modes',
    });

    expect(screen.getByText('Main content')).toBeInTheDocument();

    jest.mocked(useIsSettingsDrawer).mockReturnValue(true);
    rerender(<AppNavigationDrawer />);

    expect(screen.getByText('Settings content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Navigation modes' })).toBe(
      modeSwitcher,
    );
  });

  it('leaves mode switching to the navigation bar on mobile', () => {
    jest.mocked(useIsMobile).mockReturnValue(true);
    jest.mocked(useIsSettingsDrawer).mockReturnValue(true);

    render(<AppNavigationDrawer />);

    expect(screen.getByText('Settings content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the tabs at the top and has no search field without the customizable sidebar', () => {
    render(<AppNavigationDrawer />);

    const modeSwitcher = screen.getByRole('button', {
      name: 'Navigation modes',
    });

    expect(
      modeSwitcher.compareDocumentPosition(screen.getByText('Main content')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      screen.queryByRole('button', { name: 'Search or ask...' }),
    ).not.toBeInTheDocument();
  });

  it('puts the search field at the top and the tabs at the bottom with the customizable sidebar', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);

    render(<AppNavigationDrawer />);

    const searchField = screen.getByRole('button', {
      name: 'Search or ask...',
    });
    const mainContent = screen.getByText('Main content');
    const modeSwitcher = screen.getByRole('button', {
      name: 'Navigation modes',
    });

    expect(searchField.compareDocumentPosition(mainContent)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(mainContent.compareDocumentPosition(modeSwitcher)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps the bottom tabs mounted when the drawer content changes', () => {
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);

    const { rerender } = render(<AppNavigationDrawer />);
    const modeSwitcher = screen.getByRole('button', {
      name: 'Navigation modes',
    });

    jest.mocked(useIsSettingsDrawer).mockReturnValue(true);
    rerender(<AppNavigationDrawer />);

    expect(screen.getByText('Settings content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Navigation modes' })).toBe(
      modeSwitcher,
    );
  });
});
