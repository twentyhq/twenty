import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded');
jest.mock('@/navigation/hooks/useIsSettingsPage');

const NavigationModes = () => (
  <NavigationDrawerAnimatedCollapseWrapper>
    <button type="button">Navigation modes</button>
  </NavigationDrawerAnimatedCollapseWrapper>
);

describe('NavigationDrawerAnimatedCollapseWrapper', () => {
  beforeEach(() => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(false);
    jest.mocked(useIsSettingsPage).mockReturnValue(true);
  });

  it('keeps its children mounted while collapsing and expanding around settings', async () => {
    const { rerender } = render(<NavigationModes />);
    const navigationModesButton = screen.getByRole('button', {
      name: 'Navigation modes',
    });
    const animatedContainer = navigationModesButton.parentElement;

    jest.mocked(useIsSettingsPage).mockReturnValue(false);
    rerender(<NavigationModes />);

    await waitFor(() => {
      expect(animatedContainer).toHaveStyle({
        height: '0px',
        pointerEvents: 'none',
        width: '0px',
      });
    });

    expect(screen.getByRole('button', { name: 'Navigation modes' })).toBe(
      navigationModesButton,
    );

    jest.mocked(useIsSettingsPage).mockReturnValue(true);
    rerender(<NavigationModes />);

    await waitFor(() => {
      expect(animatedContainer).toHaveStyle({
        height: 'auto',
        pointerEvents: 'auto',
        width: 'auto',
      });
    });

    expect(screen.getByRole('button', { name: 'Navigation modes' })).toBe(
      navigationModesButton,
    );
  });
});
