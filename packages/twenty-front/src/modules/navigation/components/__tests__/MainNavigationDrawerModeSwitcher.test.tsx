import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

jest.mock('@/navigation/hooks/useActiveNavigationDrawerMode');
jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded');
jest.mock('@/navigation/hooks/useNavigationDrawerModes');
jest.mock('@/navigation/hooks/useSwitchNavigationDrawerMode');

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('twenty-ui/surfaces', () => ({
  ...jest.requireActual('twenty-ui/surfaces'),
  AppTooltip: () => null,
}));

const mockSwitchNavigationDrawerMode = jest.fn();

const renderModeSwitcher = (isLayoutCustomizationModeEnabled = false) => {
  const store = createStore();

  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MainNavigationDrawerModeSwitcher />
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

describe('MainNavigationDrawerModeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useNavigationDrawerModes).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        mode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
      {
        Icon: IconComment,
        label: 'AI',
        mode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      },
      {
        Icon: IconSettings,
        label: 'Settings',
        mode: NAVIGATION_DRAWER_TABS.SETTINGS,
      },
    ]);
    jest
      .mocked(useActiveNavigationDrawerMode)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    jest.mocked(useSwitchNavigationDrawerMode).mockReturnValue({
      switchNavigationDrawerMode: mockSwitchNavigationDrawerMode,
    });
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(true);
  });

  it('switches mode from the collapsed icon rail', async () => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(false);

    renderModeSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'AI' }));

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('switches mode from the expanded row', async () => {
    renderModeSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.SETTINGS,
    );
  });

  it.each([true, false])(
    'disables Settings while editing layout with expanded=%s and restores it afterward',
    async (isExpanded) => {
      jest
        .mocked(useIsNavigationDrawerContentExpanded)
        .mockReturnValue(isExpanded);
      const { store } = renderModeSwitcher(true);
      const settingsButton = screen.getByRole('button', { name: 'Settings' });

      expect(settingsButton).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Home' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'AI' })).toBeEnabled();

      await userEvent.click(settingsButton);

      expect(mockSwitchNavigationDrawerMode).not.toHaveBeenCalled();

      act(() => {
        store.set(isLayoutCustomizationModeEnabledState.atom, false);
      });

      expect(settingsButton).toBeEnabled();
      await userEvent.click(settingsButton);

      expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
        NAVIGATION_DRAWER_TABS.SETTINGS,
      );
    },
  );

  it('renders nothing when no mode is available', () => {
    jest.mocked(useNavigationDrawerModes).mockReturnValue([]);

    renderModeSwitcher();

    expect(
      screen.queryByRole('group', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });
});
