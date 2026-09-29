import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { t } from '@lingui/core/macro';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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
      <ListItem
        role="option"
        aria-selected={isSelected}
        selected={isSelected}
        indicator="check"
        startIcon={
          <Avatar
            name={availableWorkspace.displayName || ''}
            colorSeed={getWorkspaceAvatarColorSeed(
              availableWorkspace.displayName,
            )}
            src={getAbsoluteImageUrl(
              availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
            )}
          />
        }
      >
        {availableWorkspace.displayName ?? t`(No name)`}
      </ListItem>
    </UndecoratedLink>
  );
};
