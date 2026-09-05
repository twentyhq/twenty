import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

jest.mock('@/navigation/hooks/useNavigationDrawerModes');
jest.mock('@/navigation/hooks/useSwitchNavigationDrawerMode');

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    alphaSortedActiveNonSystemObjectMetadataItems: [],
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const AI_CHAT_PATH = '/chat/20202020-0687-4c41-b707-ed1bfca972a7';

const mockSwitchNavigationDrawerMode = jest.fn();

const ALL_MODES = [
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
];

const renderMobileNavigationBarItems = (
  pathname: string,
  previousPathnames: string[] = [],
) => {
  const store = createStore();

  const { result } = renderHook(
    () => ({
      ...useMobileNavigationBarItems(),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <MemoryRouter initialEntries={[...previousPathnames, pathname]}>
              {children}
            </MemoryRouter>
          </Provider>
        </I18nProvider>
      ),
    },
  );

  return { result, store };
};

const tapItem = (
  result: { current: { items: { name: string; onClick: () => void }[] } },
  name: string,
) => result.current.items.find((item) => item.name === name)?.onClick();

describe('useMobileNavigationBarItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    jest.mocked(useNavigationDrawerModes).mockReturnValue(ALL_MODES);
    jest.mocked(useSwitchNavigationDrawerMode).mockReturnValue({
      switchNavigationDrawerMode: mockSwitchNavigationDrawerMode,
    });
  });

  it('offers every navigation mode next to the search action', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      'search',
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      NAVIGATION_DRAWER_TABS.SETTINGS,
    ]);
  });

  it('drops the AI mode the workspace has no permission for', () => {
    jest
      .mocked(useNavigationDrawerModes)
      .mockReturnValue(
        ALL_MODES.filter(
          ({ mode }) => mode !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        ),
      );

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items.map(({ name }) => name)).toEqual([
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      'search',
      NAVIGATION_DRAWER_TABS.SETTINGS,
    ]);
  });

  it('has no item to offer when there is no navigation mode', () => {
    jest.mocked(useNavigationDrawerModes).mockReturnValue([]);

    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.items).toEqual([]);
  });

  it('marks the home mode as active outside of the settings and chat pages', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    expect(result.current.activeItemName).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('marks the AI mode as active on the chat page', () => {
    const { result } = renderMobileNavigationBarItems(AI_CHAT_PATH);

    expect(result.current.activeItemName).toBe(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('marks no tab as active on a route whose mode the bar does not offer', () => {
    jest
      .mocked(useNavigationDrawerModes)
      .mockReturnValue(
        ALL_MODES.filter(
          ({ mode }) => mode !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        ),
      );

    const { result } = renderMobileNavigationBarItems(AI_CHAT_PATH);

    expect(result.current.activeItemName).toBe('');
  });

  it('marks the settings mode as active on a settings page', () => {
    const { result } = renderMobileNavigationBarItems('/settings/profile');

    expect(result.current.activeItemName).toBe(NAVIGATION_DRAWER_TABS.SETTINGS);
  });

  it('goes to the home page rather than staying on the current one', () => {
    const { result, store } = renderMobileNavigationBarItems('/objects/people');

    act(() =>
      result.current.items
        .find(({ name }) => name === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)
        ?.onClick(),
    );

    expect(result.current.location.pathname).toBe('/home');
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  it('replaces the settings entry it leaves so back does not return to it', () => {
    const { result } = renderMobileNavigationBarItems('/settings/profile', [
      '/objects/people',
    ]);

    act(() => tapItem(result, NAVIGATION_DRAWER_TABS.NAVIGATION_MENU));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('keeps the page it leaves in history outside of settings', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    act(() => tapItem(result, NAVIGATION_DRAWER_TABS.NAVIGATION_MENU));

    expect(result.current.location.pathname).toBe('/home');

    act(() => result.current.navigate(-1));

    expect(result.current.location.pathname).toBe('/objects/people');
  });

  it('delegates the other modes to the drawer mode switch', () => {
    const { result } = renderMobileNavigationBarItems('/objects/people');

    act(() =>
      result.current.items
        .find(({ name }) => name === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)
        ?.onClick(),
    );

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });
});
