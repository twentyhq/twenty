import { ExpandedAiChatDrawerContent } from '@/ai/expanded-chat/components/ExpandedAiChatDrawerContent';
import { useIsOnExpandedAiChatPage } from '@/ai/expanded-chat/hooks/useIsOnExpandedAiChatPage';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationModeToggle } from '@/navigation/components/NavigationModeToggle';
import { NewAiChatDrawerButton } from '@/navigation/components/NewAiChatDrawerButton';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isOnExpandedAiChatPage = useIsOnExpandedAiChatPage();

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <NavigationModeToggle />
      </NavigationDrawerFixedContent>

      {isOnExpandedAiChatPage ? (
        <ExpandedAiChatDrawerContent />
      ) : (
        <>
          <NavigationDrawerScrollableContent>
            <MainNavigationDrawerNavigationContent />
          </NavigationDrawerScrollableContent>
          <NewAiChatDrawerButton />
        </>
      )}
    </NavigationDrawer>
  );
};
