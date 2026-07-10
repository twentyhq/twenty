import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { toSpliced } from '~/utils/array/toSpliced';

type MergeEmailRecipientsArgs = {
  recipients: EmailRecipient[];
  incomingRecipients: EmailRecipient[];
  replacedIndex: number | null;
};

type MergeEmailRecipientsResult = {
  nextRecipients: EmailRecipient[];
  duplicateChipKey: string | null;
};

export const mergeEmailRecipients = ({
  recipients,
  incomingRecipients,
  replacedIndex,
}: MergeEmailRecipientsArgs): MergeEmailRecipientsResult => {
  const baseRecipients =
    replacedIndex === null
      ? [...recipients]
      : toSpliced(recipients, replacedIndex, 1);
  const insertionIndex = replacedIndex ?? baseRecipients.length;

  const acceptedRecipients: EmailRecipient[] = [];
  let duplicateChipKey: string | null = null;

  for (const incomingRecipient of incomingRecipients) {
    const incomingChipKey = getEmailRecipientKey(incomingRecipient.address);
    const matchesIncomingChipKey = (recipient: EmailRecipient) =>
      getEmailRecipientKey(recipient.address) === incomingChipKey;

    const baseIndex = baseRecipients.findIndex(matchesIncomingChipKey);
    const acceptedIndex = acceptedRecipients.findIndex(matchesIncomingChipKey);

    if (baseIndex === -1 && acceptedIndex === -1) {
      acceptedRecipients.push(incomingRecipient);
      continue;
    }

    duplicateChipKey = incomingChipKey;

    const targetRecipients =
      baseIndex === -1 ? acceptedRecipients : baseRecipients;
    const targetIndex = baseIndex === -1 ? acceptedIndex : baseIndex;
    const existingRecipient = targetRecipients[targetIndex];

    if (
      isNonEmptyString(incomingRecipient.displayName) &&
      !isNonEmptyString(existingRecipient.displayName)
    ) {
      targetRecipients[targetIndex] = {
        ...existingRecipient,
        displayName: incomingRecipient.displayName,
      };
    }
  }

  return {
    nextRecipients: toSpliced(
      baseRecipients,
      insertionIndex,
      0,
      ...acceptedRecipients,
    ),
    duplicateChipKey,
  };
};
