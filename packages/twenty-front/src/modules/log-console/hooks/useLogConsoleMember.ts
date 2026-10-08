import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type LogConsoleMember } from '@/log-console/types/LogConsoleMember';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseLogConsoleMemberArgs = {
  userId?: string | null;
  userWorkspaceId?: string | null;
  actor?: Partial<FieldActorValue>;
  isImpersonator?: boolean;
};

export const useLogConsoleMember = ({
  userId,
  userWorkspaceId,
  actor,
  isImpersonator = false,
}: UseLogConsoleMemberArgs): LogConsoleMember | undefined => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const workspaceMember = currentWorkspaceMembers.find((member) =>
    isDefined(actor)
      ? member.id === actor.workspaceMemberId
      : isDefined(userWorkspaceId)
        ? member.userWorkspaceId === userWorkspaceId
        : member.userId === userId,
  );

  if (isDefined(workspaceMember)) {
    return {
      ...actor,
      name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      workspaceMemberId: workspaceMember.id,
      avatarUrl: workspaceMember.avatarUrl,
    };
  }

  if (isDefined(actor)) {
    return actor;
  }

  const isUnknownUser =
    currentWorkspaceMembers.length > 0 &&
    (isNonEmptyString(userId) || isNonEmptyString(userWorkspaceId));

  if (!isUnknownUser) {
    return undefined;
  }

  return isImpersonator
    ? { name: t`Support team`, isSupportTeam: true }
    : { name: t`Unknown user` };
};
