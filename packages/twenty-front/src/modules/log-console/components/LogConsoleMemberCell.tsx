import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type LogConsoleMemberCellProps = {
  userId?: string | null;
  userWorkspaceId?: string | null;
  actor?: Partial<FieldActorValue>;
};

export const LogConsoleMemberCell = ({
  userId,
  userWorkspaceId,
  actor,
}: LogConsoleMemberCellProps) => {
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
    return (
      <ActorDisplay
        name={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
        source={actor?.source}
        avatarUrl={workspaceMember.avatarUrl}
        workspaceMemberId={workspaceMember.id}
        context={actor?.context}
      />
    );
  }

  if (isDefined(actor)) {
    return (
      <ActorDisplay
        name={actor.name}
        source={actor.source}
        workspaceMemberId={actor.workspaceMemberId}
        context={actor.context}
      />
    );
  }

  const isUnknownUser =
    currentWorkspaceMembers.length > 0 &&
    (isNonEmptyString(userId) || isNonEmptyString(userWorkspaceId));

  return isUnknownUser ? <ActorDisplay name={t`Unknown user`} /> : null;
};
