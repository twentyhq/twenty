import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { MenuItemSelectAvatar, UndecoratedLink } from 'twenty-ui/navigation';
import {
  GET_LOGIN_TOKEN_FOR_WORKSPACE,
  type GetLoginTokenForWorkspaceMutation,
  type GetLoginTokenForWorkspaceMutationVariables,
} from '@/auth/graphql/mutations/getLoginTokenForWorkspace';
import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const AvailableWorkspaceItem = ({
  availableWorkspace,
  isSelected,
  shouldUseFreshLoginToken,
}: {
  availableWorkspace: AvailableWorkspace;
  isSelected: boolean;
  shouldUseFreshLoginToken: boolean;
}) => {
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const [getLoginTokenForWorkspace] = useMutation<
    GetLoginTokenForWorkspaceMutation,
    GetLoginTokenForWorkspaceMutationVariables
  >(GET_LOGIN_TOKEN_FOR_WORKSPACE);

  const { pathname, searchParams } =
    getAvailableWorkspacePathAndSearchParams(availableWorkspace);

  const handleChange = async () => {
    const workspaceToRedirect = shouldUseFreshLoginToken
      ? await getAvailableWorkspaceWithFreshLoginToken()
      : availableWorkspace;
    const { pathname, searchParams } =
      getAvailableWorkspacePathAndSearchParams(workspaceToRedirect);

    await redirectToWorkspaceDomain(
      getWorkspaceUrl(workspaceToRedirect.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  const getAvailableWorkspaceWithFreshLoginToken =
    async (): Promise<AvailableWorkspace> => {
      const result = await getLoginTokenForWorkspace({
        variables: {
          workspaceId: availableWorkspace.id,
        },
      });

      const loginToken =
        result.data?.getLoginTokenForWorkspace.loginToken.token;

      if (!isDefined(loginToken)) {
        throw new Error('Could not generate login token for workspace');
      }

      return {
        ...availableWorkspace,
        loginToken,
      };
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
        void handleChange();
      }}
    >
      <MenuItemSelectAvatar
        text={availableWorkspace.displayName ?? t`(No name)`}
        avatar={
          <Avatar
            placeholder={availableWorkspace.displayName || ''}
            avatarUrl={getAbsoluteImageUrl(
              availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
            )}
          />
        }
        selected={isSelected}
      />
    </UndecoratedLink>
  );
};
