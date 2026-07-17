import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getEmailIdentityDisplayName } from '@/activities/emails/utils/getEmailIdentityDisplayName';

export const getDisplayNameFromParticipant = ({
  participant,
  shouldUseFullName = false,
}: {
  participant: EmailThreadMessageParticipant;
  shouldUseFullName?: boolean;
}) => {
  const buildName = (name?: { firstName?: string; lastName?: string }) => {
    if (!isDefined(name)) {
      return undefined;
    }

    const nameParts = shouldUseFullName
      ? [name.firstName, name.lastName]
      : [name.firstName];

    return nameParts.filter(isNonEmptyString).join(' ');
  };

  return getEmailIdentityDisplayName({
    personName: isDefined(participant.person)
      ? buildName(participant.person.name)
      : undefined,
    workspaceMemberName: isDefined(participant.workspaceMember)
      ? buildName(participant.workspaceMember.name)
      : undefined,
    displayName: participant.displayName,
    handle: participant.handle,
  });
};
