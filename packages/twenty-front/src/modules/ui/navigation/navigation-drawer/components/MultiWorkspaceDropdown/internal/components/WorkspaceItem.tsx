import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar, UndecoratedLink } from 'twenty-ui/navigation';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Workspaces } from '@/auth/states/workspaces';
import { AvailableWorkspacesToJoin } from '~/generated/graphql';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';

type WorkspaceItemProps = {
  workspace: Workspaces[number] | AvailableWorkspacesToJoin;
  isSelected: boolean;
  link: string;
};

export const WorkspaceItem = ({
  workspace,
  isSelected,
  link,
}: WorkspaceItemProps) => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const handleChange = async () => {
    const url = new URL(link);
    await redirectToWorkspaceDomain(
      url.origin,
      url.pathname,
      Object.fromEntries(url.searchParams.entries()),
    );
  };

  return (
    <UndecoratedLink key={workspace.id} to={link} onClick={handleChange}>
      <MenuItemSelectAvatar
        text={workspace.displayName ?? '(No name)'}
        avatar={
          <Avatar
            placeholder={workspace.displayName || ''}
            avatarUrl={workspace.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        selected={isSelected}
      />
    </UndecoratedLink>
  );
};
