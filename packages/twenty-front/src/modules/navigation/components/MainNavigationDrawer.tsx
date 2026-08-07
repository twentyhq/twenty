import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { ExpandedAiChatDrawerThreads } from '@/ai/expanded-chat/components/ExpandedAiChatDrawerThreads';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationModeToggle } from '@/navigation/components/NavigationModeToggle';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const location = useLocation();

  const isOnExpandedAiChatPage = location.pathname === AppPath.AiChat;

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <NavigationModeToggle />
      </NavigationDrawerFixedContent>

      {isOnExpandedAiChatPage ? (
        <ExpandedAiChatDrawerThreads />
      ) : (
        <NavigationDrawerScrollableContent>
          <MainNavigationDrawerNavigationContent />
        </NavigationDrawerScrollableContent>
      )}
    </NavigationDrawer>
  );
};
