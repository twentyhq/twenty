import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { t } from '@lingui/core/macro';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
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
    <Dropdown.OptionItem
      render={
        <a
          href={buildWorkspaceUrl(
            getWorkspaceUrl(availableWorkspace.workspaceUrls),
            pathname,
            searchParams,
          )}
        />
      }
      onClick={(event) => {
        event.preventDefault();
        handleChange();
      }}
      selected={isSelected}
      startIcon={
        <Avatar
          imageProps={{ alt: '' }}
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
    </Dropdown.OptionItem>
  );
};
