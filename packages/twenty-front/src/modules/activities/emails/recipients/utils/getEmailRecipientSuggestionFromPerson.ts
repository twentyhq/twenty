import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipientPerson } from '@/activities/emails/recipients/types/EmailRecipientPerson';
import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getEmailRecipientFullName } from '@/activities/emails/recipients/utils/getEmailRecipientFullName';

export const getEmailRecipientSuggestionFromPerson = ({
  person,
}: {
  person: EmailRecipientPerson;
}): EmailRecipientSuggestion => {
  const address = person.emails.primaryEmail;
  const fullName = getEmailRecipientFullName(person.name);
  const hasFullName = isNonEmptyString(fullName);

  return {
    suggestionId: `person-${person.id}`,
    recipient: hasFullName ? { address, displayName: fullName } : { address },
    label: hasFullName ? fullName : address,
    secondaryText: hasFullName ? address : '',
    avatarUrl: person.avatarUrl,
    avatarColorSeed: person.id,
  };
};
