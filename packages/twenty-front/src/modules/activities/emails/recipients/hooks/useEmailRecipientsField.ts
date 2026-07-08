import { useState } from 'react';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { mergeEmailRecipients } from '@/activities/emails/recipients/utils/mergeEmailRecipients';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { toSpliced } from '~/utils/array/toSpliced';

type UseEmailRecipientsFieldArgs = {
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
};

type ChipFlash = {
  chipKey: string;
  nonce: number;
};

export const useEmailRecipientsField = ({
  recipients,
  onChange,
}: UseEmailRecipientsFieldArgs) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(
    null,
  );
  const [chipFlash, setChipFlash] = useState<ChipFlash | null>(null);

  const isEditing = editingIndex !== null;

  const flashChip = (chipKey: string) => {
    setChipFlash((previousFlash) => ({
      chipKey,
      nonce: (previousFlash?.nonce ?? 0) + 1,
    }));
  };

  const clearChipFlash = () => setChipFlash(null);

  const addRecipients = (
    addedRecipients: EmailRecipient[],
    replacedIndex: number | null,
  ) => {
    const baseRecipients =
      replacedIndex === null
        ? recipients
        : toSpliced(recipients, replacedIndex, 1);

    const { mergedRecipients, duplicateKeys } = mergeEmailRecipients(
      baseRecipients,
      addedRecipients,
      replacedIndex ?? baseRecipients.length,
    );

    onChange(mergedRecipients);

    const firstDuplicateKey = duplicateKeys[0];
    if (firstDuplicateKey !== undefined) {
      flashChip(firstDuplicateKey);
    }
  };

  const commitInput = () => {
    const parsedRecipients = parseEmailRecipients(inputValue);

    if (editingIndex !== null) {
      if (parsedRecipients.length === 0) {
        onChange(toSpliced(recipients, editingIndex, 1));
      } else {
        addRecipients(parsedRecipients, editingIndex);
      }

      setEditingIndex(null);
      setInputValue('');
      return;
    }

    if (parsedRecipients.length > 0) {
      addRecipients(parsedRecipients, null);
    }

    setInputValue('');
  };

  const addRecipient = (recipient: EmailRecipient) => {
    addRecipients([recipient], editingIndex);
    setEditingIndex(null);
    setInputValue('');
  };

  const beginEditingChip = (chipIndex: number) => {
    setEditingIndex(chipIndex);
    setInputValue(formatEmailRecipient(recipients[chipIndex]));
    setSelectedChipIndex(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setInputValue('');
  };

  const removeRecipientAtIndex = (chipIndex: number) => {
    onChange(toSpliced(recipients, chipIndex, 1));
    setSelectedChipIndex(null);

    if (editingIndex !== null && chipIndex < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const removeRecipientWithKeyboard = () => {
    if (selectedChipIndex === null) {
      return;
    }

    const removedIndex = selectedChipIndex;
    onChange(toSpliced(recipients, removedIndex, 1));

    const remainingCount = recipients.length - 1;
    setSelectedChipIndex(
      removedIndex > 0 && remainingCount > 0 ? removedIndex - 1 : null,
    );
  };

  const selectChip = (chipIndex: number) => {
    setSelectedChipIndex(chipIndex);
  };

  const clearChipSelection = () => {
    setSelectedChipIndex(null);
  };

  const moveChipSelection = (direction: -1 | 1): number | null => {
    if (recipients.length === 0) {
      return null;
    }

    if (selectedChipIndex === null) {
      if (direction === 1) {
        return null;
      }

      const lastIndex = recipients.length - 1;
      setSelectedChipIndex(lastIndex);
      return lastIndex;
    }

    const nextIndex = selectedChipIndex + direction;

    if (nextIndex >= recipients.length) {
      setSelectedChipIndex(null);
      return null;
    }

    const boundedIndex = Math.max(nextIndex, 0);
    setSelectedChipIndex(boundedIndex);
    return boundedIndex;
  };

  const getChipKey = (recipient: EmailRecipient) =>
    getEmailRecipientKey(recipient.address);

  return {
    inputValue,
    setInputValue,
    editingIndex,
    isEditing,
    selectedChipIndex,
    chipFlash,
    clearChipFlash,
    commitInput,
    addRecipient,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeRecipientWithKeyboard,
    selectChip,
    clearChipSelection,
    moveChipSelection,
    getChipKey,
  };
};
