import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export const getDisplayNameFromParticipant = ({
  participant,
  shouldUseFullName = false,
}: {
  participant: EmailThreadMessageParticipant;
  shouldUseFullName?: boolean;
}) => {
  if (participant.person) {
    return (
      `${participant.person?.name?.firstName}` +
      (shouldUseFullName ? ` ${participant.person?.name?.lastName}` : '')
    );
  }

  if (participant.workspaceMember) {
    return (
      participant.workspaceMember?.name?.firstName +
      (shouldUseFullName
        ? ` ${participant.workspaceMember?.name?.lastName}`
        : '')
    );
  }

  if (participant.displayName) {
    return participant.displayName;
  }

  if (participant.handle) {
    return participant.handle;
  }

  return 'Unknown';
};
