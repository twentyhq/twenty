import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

jest.mock('@/navigation/hooks/useIsSettingsDrawer');
jest.mock('@/ui/utilities/responsive/hooks/useIsMobile');

jest.mock('@/navigation/components/MainNavigationDrawerContent', () => ({
  MainNavigationDrawerContent: () => <div>Main content</div>,
}));

jest.mock('@/navigation/components/MainNavigationDrawerModeSwitcher', () => ({
  MainNavigationDrawerModeSwitcher: () => (
    <button type="button">Navigation modes</button>
  ),
}));

jest.mock('@/navigation/components/SettingsNavigationDrawerContent', () => ({
  SettingsNavigationDrawerContent: () => <div>Settings content</div>,
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
});
