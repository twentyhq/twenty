import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type Person } from '@/people/types/Person';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from 'twenty-shared/utils';

type ParticipantWithDisplayName = Pick<
  EmailThreadMessageParticipant,
  'displayName' | 'handle'
> & {
  person?: Pick<Person, 'name'> | null;
  workspaceMember?: Pick<WorkspaceMember, 'name'> | null;
};

export const getDisplayNameFromParticipant = ({
  participant,
  shouldUseFullName = false,
}: {
  participant: ParticipantWithDisplayName;
  shouldUseFullName?: boolean;
}) => {
  if (isDefined(participant.person)) {
    return (
      `${participant.person?.name?.firstName}` +
      (shouldUseFullName ? ` ${participant.person?.name?.lastName}` : '')
    );
  }

  if (isDefined(participant.workspaceMember)) {
    return (
      participant.workspaceMember?.name?.firstName +
      (shouldUseFullName
        ? ` ${participant.workspaceMember?.name?.lastName}`
        : '')
    );
  }

  if (isNonEmptyString(participant.displayName)) {
    return participant.displayName;
  }

  if (isNonEmptyString(participant.handle)) {
    return participant.handle;
  }

  return 'Unknown';
};
