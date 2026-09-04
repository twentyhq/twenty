import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { render, screen } from '@testing-library/react';

jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded');
jest.mock('@/navigation/hooks/useIsSettingsPage');

describe('NavigationDrawerAnimatedCollapseWrapper', () => {
  beforeEach(() => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(true);
    jest.mocked(useIsSettingsPage).mockReturnValue(true);
  });

  it('keeps its children mounted when leaving settings', () => {
    const { rerender } = render(
      <NavigationDrawerAnimatedCollapseWrapper>
        <button type="button">Navigation modes</button>
      </NavigationDrawerAnimatedCollapseWrapper>,
    );
    const navigationModesButton = screen.getByRole('button', {
      name: 'Navigation modes',
    });

    jest.mocked(useIsSettingsPage).mockReturnValue(false);
    rerender(
      <NavigationDrawerAnimatedCollapseWrapper>
        <button type="button">Navigation modes</button>
      </NavigationDrawerAnimatedCollapseWrapper>,
    );

    expect(screen.getByRole('button', { name: 'Navigation modes' })).toBe(
      navigationModesButton,
    );
  });
});
