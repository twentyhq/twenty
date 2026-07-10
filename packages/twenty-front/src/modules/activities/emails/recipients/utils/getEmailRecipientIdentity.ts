import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientIdentity } from '@/activities/emails/recipients/types/EmailRecipientIdentity';

const getFullName = (
  name: { firstName: string; lastName: string } | undefined,
): string => `${name?.firstName ?? ''} ${name?.lastName ?? ''}`.trim();

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
      getFullName(person?.name ?? workspaceMember?.name),
      recipient.displayName ?? '',
    ].find(isNonEmptyString) ?? recipient.address;

  if (isDefined(person)) {
    return {
      kind: 'person',
      label,
      resolvedRecord: { id: person.id, avatarUrl: person.avatarUrl },
    };
  }

  if (isDefined(workspaceMember)) {
    return {
      kind: 'workspaceMember',
      label,
      resolvedRecord: {
        id: workspaceMember.id,
        avatarUrl: workspaceMember.avatarUrl ?? undefined,
      },
    };
  }

  return { kind: 'unknown', label };
};
