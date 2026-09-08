import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { WorkspaceDropdownTrigger } from 'twenty-ui/navigation';

type MultiWorkspaceDropdownClickableComponentProps = {
  disabled?: boolean;
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownClickableComponent = ({
  disabled,
  shouldHideLabel = false,
}: MultiWorkspaceDropdownClickableComponentProps) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();

  return (
    <WorkspaceDropdownTrigger
      data-testid="workspace-dropdown"
      isExpanded={isNavigationDrawerExpanded}
      disabled={disabled}
      hideLabel={shouldHideLabel}
      workspaceName={currentWorkspace?.displayName ?? ''}
      avatarUrl={getAbsoluteImageUrl(
        currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
      )}
      LabelWrapper={NavigationDrawerAnimatedCollapseWrapper}
    />
  );
};
