import { MainNavigationDrawerContent } from '@/navigation/components/MainNavigationDrawerContent';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

jest.mock('@/navigation/hooks/useActiveNavigationDrawerMode');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock(
  '@/navigation/components/MainNavigationDrawerNavigationContent',
  () => ({
    MainNavigationDrawerNavigationContent: () => <div>Object navigation</div>,
  }),
);
jest.mock('@/navigation/components/NavigationDrawerTabbedContent', () => ({
  NavigationDrawerTabbedContent: ({
    showAiChatContent,
    navigationContent,
  }: {
    showAiChatContent: boolean;
    navigationContent: ReactNode;
  }) => (showAiChatContent ? <div>Chat navigation</div> : navigationContent),
}));
jest.mock(
  '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent',
  () => ({
    NavigationDrawerScrollableContent: ({
      children,
    }: {
      children: ReactNode;
    }) => children,
  }),
);

describe('MainNavigationDrawerContent', () => {
  it.each([false, true])(
    'keeps AI navigation active when expanded is %s',
    (isExpanded) => {
      jest
        .mocked(useActiveNavigationDrawerMode)
        .mockReturnValue(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
      jest.mocked(useHasPermissionFlag).mockReturnValue(true);
      const store = createStore();
      store.set(isNavigationDrawerExpandedState.atom, isExpanded);

      render(
        <Provider store={store}>
          <MainNavigationDrawerContent />
        </Provider>,
      );

      expect(screen.getByText('Chat navigation')).toBeVisible();
      expect(screen.queryByText('Object navigation')).not.toBeInTheDocument();
    },
  );
});
