import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar, UndecoratedLink } from 'twenty-ui/navigation';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { type AvailableWorkspace } from '~/generated/graphql';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { t } from '@lingui/core/macro';
import React from 'react';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

export const AvailableWorkspaceItem = ({
  availableWorkspace,
  isSelected,
}: {
  availableWorkspace: AvailableWorkspace;
  isSelected: boolean;
}) => {
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const { pathname, searchParams } =
    getAvailableWorkspacePathAndSearchParams(availableWorkspace);

  const handleChange = async () => {
    await redirectToWorkspaceDomain(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  return (
    <UndecoratedLink
      key={availableWorkspace.id}
      to={buildWorkspaceUrl(
        getWorkspaceUrl(availableWorkspace.workspaceUrls),
        pathname,
        searchParams,
      )}
      onClick={(event) => {
        event.preventDefault();
        handleChange();
      }}
    >
      <MenuItemSelectAvatar
        text={availableWorkspace.displayName ?? t`(No name)`}
        avatar={
          <Avatar
            placeholder={availableWorkspace.displayName || ''}
            avatarUrl={availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        selected={isSelected}
      />
    </UndecoratedLink>
  );
};
