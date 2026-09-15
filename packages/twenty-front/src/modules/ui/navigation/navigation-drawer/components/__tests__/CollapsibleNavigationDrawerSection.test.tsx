import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile');

describe('CollapsibleNavigationDrawerSection', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.mocked(useIsMobile).mockReturnValue(false);
  });

  it('keeps settings reachable in the collapsed rail without changing the saved section state', async () => {
    const store = createStore();
    const user = userEvent.setup();
    store.set(isNavigationDrawerExpandedState.atom, true);
    store.set(
      isNavigationSectionOpenFamilyState.atomFamily('settings/User'),
      true,
    );

    render(
      <Provider store={store}>
        <CollapsibleNavigationDrawerSection
          sectionId="settings/User"
          label="User"
        >
          <a href="/settings/profile">Profile</a>
        </CollapsibleNavigationDrawerSection>
      </Provider>,
    );

    await user.click(screen.getByText('User'));
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Profile' }),
      ).not.toBeInTheDocument();
    });

    act(() => store.set(isNavigationDrawerExpandedState.atom, false));
    expect(await screen.findByRole('link', { name: 'Profile' })).toBeVisible();
    expect(screen.queryByText('User')).not.toBeInTheDocument();

    act(() => store.set(isNavigationDrawerExpandedState.atom, true));
    expect(screen.getByText('User')).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Profile' }),
      ).not.toBeInTheDocument();
    });
  });
});
