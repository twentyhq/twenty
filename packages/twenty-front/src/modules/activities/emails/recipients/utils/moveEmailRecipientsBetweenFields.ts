import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { mergeEmailRecipients } from '@/activities/emails/recipients/utils/mergeEmailRecipients';
import { toSpliced } from '~/utils/array/toSpliced';

export type EmailRecipientsByFieldId = Record<
  EmailRecipientsFieldId,
  EmailRecipient[]
>;

// Both lists share recipient objects, so identity comparison is enough.
const areRecipientListsEqual = (
  recipients: EmailRecipient[],
  otherRecipients: EmailRecipient[],
) =>
  recipients.length === otherRecipients.length &&
  recipients.every((recipient, index) => recipient === otherRecipients[index]);

type MoveEmailRecipientsBetweenFieldsArgs = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  sourceFieldId: EmailRecipientsFieldId;
  movedIndices: number[];
  destinationFieldId: EmailRecipientsFieldId;
  destinationIndex: number;
};

export const moveEmailRecipientsBetweenFields = ({
  recipientsByFieldId,
  sourceFieldId,
  movedIndices,
  destinationFieldId,
  destinationIndex,
}: MoveEmailRecipientsBetweenFieldsArgs): EmailRecipientsByFieldId => {
  const sourceRecipients = recipientsByFieldId[sourceFieldId];

  const sortedMovedIndices = [...new Set(movedIndices)]
    .filter((index) => index >= 0 && index < sourceRecipients.length)
    .sort((a, b) => a - b);

  if (sortedMovedIndices.length === 0) {
    return recipientsByFieldId;
  }

  const movedIndexSet = new Set(sortedMovedIndices);
  const movedRecipients = sortedMovedIndices.map(
    (index) => sourceRecipients[index],
  );
  const remainingSourceRecipients = sourceRecipients.filter(
    (_recipient, index) => !movedIndexSet.has(index),
  );

  if (sourceFieldId === destinationFieldId) {
    // Removing the dragged chips first shifts every later slot left.
    const removedBeforeDestinationCount = sortedMovedIndices.filter(
      (index) => index < destinationIndex,
    ).length;
    const adjustedDestinationIndex =
      destinationIndex - removedBeforeDestinationCount;

    // Spliced, not merged: a draft can hold the same address twice, and a reorder must keep the count.
    const reorderedRecipients = toSpliced(
      remainingSourceRecipients,
      adjustedDestinationIndex,
      0,
      ...movedRecipients,
    );

    return areRecipientListsEqual(sourceRecipients, reorderedRecipients)
      ? recipientsByFieldId
      : { ...recipientsByFieldId, [sourceFieldId]: reorderedRecipients };
  }

  const { mergedRecipients } = mergeEmailRecipients(
    recipientsByFieldId[destinationFieldId],
    movedRecipients,
    destinationIndex,
  );

  return {
    ...recipientsByFieldId,
    [sourceFieldId]: remainingSourceRecipients,
    [destinationFieldId]: mergedRecipients,
  };
};
