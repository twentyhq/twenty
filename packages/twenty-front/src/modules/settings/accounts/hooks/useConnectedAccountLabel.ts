import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const useConnectedAccountLabel = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const getConnectionLabel = ({
    account,
    index,
  }: {
    account: Pick<
      ConsolidatedConnectedAccount,
      'name' | 'userWorkspaceId' | 'visibility'
    >;
    index: number;
  }) => {
    const owner = currentWorkspaceMembers.find(
      (member) => member.userWorkspaceId === account.userWorkspaceId,
    );
    const ownerName =
      account.userWorkspaceId === currentWorkspaceMember?.userWorkspaceId
        ? t`You`
        : isDefined(owner)
          ? getWorkspaceMemberNameOrEmail(owner)
          : t`Another member`;
    const name = isNonEmptyString(account.name)
      ? account.name
      : t`Connection ${index + 1}`;
    const visibility =
      account.visibility === 'workspace' ? t`Shared` : t`Personal`;

    return `${name} · ${visibility} · ${ownerName}`;
  };

  return { getConnectionLabel };
};
