import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type AdminPanelTopWorkspace } from '~/generated-admin/graphql';

export const getAdminPanelTopWorkspaceGroups = ({
  topWorkspaces,
  currentWorkspace,
  searchTerm,
}: {
  topWorkspaces: AdminPanelTopWorkspace[];
  currentWorkspace: Pick<
    CurrentWorkspace,
    'id' | 'displayName' | 'logo' | 'subdomain' | 'workspaceMembersCount'
  > | null;
  searchTerm: string;
}): AdminPanelTopWorkspace[][] => {
  const listedCurrentWorkspace = topWorkspaces.find(
    (workspace) => workspace.id === currentWorkspace?.id,
  );

  if (isDefined(listedCurrentWorkspace)) {
    return [
      [listedCurrentWorkspace],
      topWorkspaces.filter(
        (workspace) => workspace.id !== listedCurrentWorkspace.id,
      ),
    ].filter(isNonEmptyArray);
  }

  if (!isDefined(currentWorkspace) || isNonEmptyString(searchTerm.trim())) {
    return [topWorkspaces].filter(isNonEmptyArray);
  }

  return [
    [
      {
        id: currentWorkspace.id,
        name: currentWorkspace.displayName ?? '',
        logoUrl: currentWorkspace.logo,
        subdomain: currentWorkspace.subdomain,
        totalUsers: currentWorkspace.workspaceMembersCount ?? 0,
      },
    ],
    topWorkspaces,
  ].filter(isNonEmptyArray);
};
