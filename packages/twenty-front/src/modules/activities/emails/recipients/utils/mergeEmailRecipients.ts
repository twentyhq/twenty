import { isNonEmptyString } from '@sniptt/guards';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { toSpliced } from '~/utils/array/toSpliced';

type MergeEmailRecipientsResult = {
  mergedRecipients: EmailRecipient[];
  duplicateKeys: string[];
};

export const mergeEmailRecipients = (
  baseRecipients: EmailRecipient[],
  addedRecipients: EmailRecipient[],
  insertAtIndex: number,
): MergeEmailRecipientsResult => {
  const baseRecipientKeys = new Set(
    baseRecipients.map((baseRecipient) =>
      getEmailRecipientKey(baseRecipient.address),
    ),
  );

  const uniqueAddedRecipients: EmailRecipient[] = [];
  const uniqueAddedRecipientKeys = new Set<string>();
  const duplicateKeys: string[] = [];
  const displayNameUpgrades = new Map<string, string>();

  for (const addedRecipient of addedRecipients) {
    const recipientKey = getEmailRecipientKey(addedRecipient.address);

    if (baseRecipientKeys.has(recipientKey)) {
      duplicateKeys.push(recipientKey);

      if (isNonEmptyString(addedRecipient.displayName)) {
        displayNameUpgrades.set(recipientKey, addedRecipient.displayName);
      }
      continue;
    }

    if (uniqueAddedRecipientKeys.has(recipientKey)) {
      duplicateKeys.push(recipientKey);
      continue;
    }

    uniqueAddedRecipientKeys.add(recipientKey);
    uniqueAddedRecipients.push(addedRecipient);
  }

  const upgradedBaseRecipients = baseRecipients.map((baseRecipient) => {
    const upgradedDisplayName = displayNameUpgrades.get(
      getEmailRecipientKey(baseRecipient.address),
    );

    return upgradedDisplayName !== undefined &&
      !isNonEmptyString(baseRecipient.displayName)
      ? { ...baseRecipient, displayName: upgradedDisplayName }
      : baseRecipient;
  });

  return {
    mergedRecipients: toSpliced(
      upgradedBaseRecipients,
      insertAtIndex,
      0,
      ...uniqueAddedRecipients,
    ),
    duplicateKeys,
  };
};
