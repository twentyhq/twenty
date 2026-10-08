import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { canManageConnectedAccount } from '@/settings/accounts/utils/canManageConnectedAccount';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useConnectedAccountAdministration = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const canManageWorkspace = useHasPermissionFlag(PermissionFlagType.WORKSPACE);
  const canManageApplications = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const canManageAccount = (
    account: Pick<
      ConsolidatedConnectedAccount,
      'userWorkspaceId' | 'visibility' | 'provider'
    >,
  ) =>
    canManageConnectedAccount({
      account,
      userWorkspaceId: currentWorkspaceMember?.userWorkspaceId ?? undefined,
      canManageWorkspace,
      canManageApplications,
    });

  return { canManageAccount };
};
