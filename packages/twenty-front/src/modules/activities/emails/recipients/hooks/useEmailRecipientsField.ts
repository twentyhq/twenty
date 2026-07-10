import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  formatEmailAddressWithDisplayName,
  isDefined,
  parseEmailAddressList,
} from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { mergeEmailRecipients } from '@/activities/emails/recipients/utils/mergeEmailRecipients';
import { toSpliced } from '~/utils/array/toSpliced';

type EmailRecipientChipFlash = {
  chipKey: string;
  nonce: number;
};

type UseEmailRecipientsFieldArgs = {
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
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
  const [chipFlash, setChipFlash] = useState<EmailRecipientChipFlash | null>(
    null,
  );

  const isEditing = editingIndex !== null;

  const applyIncomingRecipients = ({
    incomingRecipients,
    replacedIndex,
  }: {
    incomingRecipients: EmailRecipient[];
    replacedIndex: number | null;
  }) => {
    const { nextRecipients, duplicateChipKey } = mergeEmailRecipients({
      recipients,
      incomingRecipients,
      replacedIndex,
    });

    onChange(nextRecipients);

    if (isDefined(duplicateChipKey)) {
      setChipFlash((previousChipFlash) => ({
        chipKey: duplicateChipKey,
        nonce: (previousChipFlash?.nonce ?? 0) + 1,
      }));
    }
  };

  const commitInput = () => {
    const trimmedInputValue = inputValue.trim();
    const parsedRecipients = parseEmailAddressList(trimmedInputValue);
    const incomingRecipients =
      parsedRecipients.length === 0 && isNonEmptyString(trimmedInputValue)
        ? [{ address: trimmedInputValue }]
        : parsedRecipients;

    if (incomingRecipients.length === 0 && editingIndex === null) {
      setInputValue('');
      return;
    }

    applyIncomingRecipients({
      incomingRecipients,
      replacedIndex: editingIndex,
    });
    setEditingIndex(null);
    setInputValue('');
  };

  const addRecipient = (recipient: EmailRecipient) => {
    applyIncomingRecipients({
      incomingRecipients: [recipient],
      replacedIndex: null,
    });
    setInputValue('');
  };

  const addRecipients = (
    incomingRecipients: EmailRecipient[],
    replacedIndex: number | null,
  ) => {
    applyIncomingRecipients({ incomingRecipients, replacedIndex });
  };

  const beginEditingChip = (index: number) => {
    const recipient = recipients.at(index);

    if (!isDefined(recipient)) {
      return;
    }

    setEditingIndex(index);
    setInputValue(formatEmailAddressWithDisplayName(recipient));
    setSelectedChipIndex(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setInputValue('');
  };

  const removeRecipientAtIndex = (index: number) => {
    onChange(toSpliced(recipients, index, 1));
    setSelectedChipIndex(null);

    if (editingIndex === null) {
      return;
    }

    if (index === editingIndex) {
      setEditingIndex(null);
      setInputValue('');
      return;
    }

    if (index < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const removeRecipientWithKeyboard = () => {
    if (selectedChipIndex === null) {
      return;
    }

    onChange(toSpliced(recipients, selectedChipIndex, 1));
    setSelectedChipIndex(selectedChipIndex > 0 ? selectedChipIndex - 1 : null);
  };

  const computeNextSelectedChipIndex = (direction: -1 | 1): number | null => {
    const lastChipIndex = recipients.length - 1;

    if (selectedChipIndex === null) {
      if (direction === -1 && lastChipIndex >= 0) {
        return lastChipIndex;
      }

      return null;
    }

    const movedIndex = selectedChipIndex + direction;

    if (movedIndex > lastChipIndex) {
      return null;
    }

    return Math.max(movedIndex, 0);
  };

  const moveChipSelection = (direction: -1 | 1): number | null => {
    const nextSelectedChipIndex = computeNextSelectedChipIndex(direction);

    setSelectedChipIndex(nextSelectedChipIndex);

    return nextSelectedChipIndex;
  };

  const clearChipSelection = () => {
    setSelectedChipIndex(null);
  };

  return {
    inputValue,
    setInputValue,
    editingIndex,
    isEditing,
    selectedChipIndex,
    chipFlash,
    commitInput,
    addRecipient,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeRecipientWithKeyboard,
    clearChipSelection,
    moveChipSelection,
  };
};
