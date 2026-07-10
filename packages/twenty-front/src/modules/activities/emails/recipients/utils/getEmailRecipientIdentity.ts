import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientIdentity } from '@/activities/emails/recipients/types/EmailRecipientIdentity';
import { getEmailRecipientFullName } from '@/activities/emails/recipients/utils/getEmailRecipientFullName';

export const getEmailRecipientIdentity = ({
  recipient,
  resolution,
}: {
  recipient: EmailRecipient;
  resolution?: EmailRecipientResolution;
}): EmailRecipientIdentity => {
  const person = resolution?.person;
  const workspaceMember = resolution?.workspaceMember;

  const label =
    [
      getEmailRecipientFullName(person?.name ?? workspaceMember?.name),
      recipient.displayName ?? '',
    ].find(isNonEmptyString) ?? recipient.address;

  if (isDefined(person)) {
    return {
      label,
      resolvedRecord: {
        kind: 'person',
        id: person.id,
        avatarUrl: person.avatarUrl,
      },
    };
  }

  if (isDefined(workspaceMember)) {
    return {
      label,
      resolvedRecord: {
        kind: 'workspaceMember',
        id: workspaceMember.id,
        avatarUrl: workspaceMember.avatarUrl ?? undefined,
      },
    };
  }

  return { label };
};
