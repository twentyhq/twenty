import { useMemo, useState } from 'react';

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

// The selection is stored as recipient keys rather than array positions: a drag
// can reorder the field underneath it, and positions would then point at
// whichever chips happen to have moved into those slots.
// anchorKey is where a shift-extended range starts and focusKey is the chip the
// keyboard cursor sits on, so shift+arrow can grow and shrink the same range
// the way a text selection does.
type ChipSelection = {
  anchorKey: string;
  focusKey: string;
  keys: string[];
};

export const useEmailRecipientsField = ({
  recipients,
  onChange,
}: UseEmailRecipientsFieldArgs) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [chipSelection, setChipSelection] = useState<ChipSelection | null>(
    null,
  );
  const [chipFlash, setChipFlash] = useState<ChipFlash | null>(null);

  const isEditing = editingIndex !== null;

  const recipientKeys = useMemo(
    () =>
      recipients.map((recipient) => getEmailRecipientKey(recipient.address)),
    [recipients],
  );

  const selectedChipIndices = useMemo(() => {
    if (chipSelection === null) {
      return [];
    }

    const selectedKeys = new Set(chipSelection.keys);

    return recipientKeys.reduce<number[]>((indices, recipientKey, index) => {
      if (selectedKeys.has(recipientKey)) {
        indices.push(index);
      }

      return indices;
    }, []);
  }, [chipSelection, recipientKeys]);

  const findKeyIndex = (chipKey: string | undefined): number | null => {
    if (chipKey === undefined) {
      return null;
    }

    const index = recipientKeys.indexOf(chipKey);

    return index === -1 ? null : index;
  };

  const selectionFocusIndex = findKeyIndex(chipSelection?.focusKey);
  const selectionAnchorIndex = findKeyIndex(chipSelection?.anchorKey);

  const buildSelection = (
    anchorIndex: number,
    focusIndex: number,
  ): ChipSelection | null => {
    const anchorKey = recipientKeys[anchorIndex];
    const focusKey = recipientKeys[focusIndex];

    if (anchorKey === undefined || focusKey === undefined) {
      return null;
    }

    return {
      anchorKey,
      focusKey,
      keys: recipientKeys.slice(
        Math.min(anchorIndex, focusIndex),
        Math.max(anchorIndex, focusIndex) + 1,
      ),
    };
  };

  const flashChip = (chipKey: string) => {
    setChipFlash((previousFlash) => ({
      chipKey,
      nonce: (previousFlash?.nonce ?? 0) + 1,
    }));
  };

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

  const commitRecipients = (committedRecipients: EmailRecipient[]) => {
    if (editingIndex !== null && committedRecipients.length === 0) {
      onChange(toSpliced(recipients, editingIndex, 1));
    } else if (committedRecipients.length > 0) {
      addRecipients(committedRecipients, editingIndex);
    }

    setEditingIndex(null);
    setInputValue('');
  };

  const commitInput = () => {
    commitRecipients(parseEmailRecipients(inputValue));
  };

  const addRecipient = (recipient: EmailRecipient) => {
    commitRecipients([recipient]);
  };

  const beginEditingChip = (chipIndex: number) => {
    setEditingIndex(chipIndex);
    setInputValue(formatEmailRecipient(recipients[chipIndex]));
    setChipSelection(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setInputValue('');
  };

  const removeRecipientAtIndex = (chipIndex: number) => {
    onChange(toSpliced(recipients, chipIndex, 1));
    setChipSelection(null);

    if (editingIndex !== null && chipIndex < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const removeSelectedRecipients = () => {
    if (selectedChipIndices.length === 0) {
      return;
    }

    const removedIndices = new Set(selectedChipIndices);

    onChange(
      recipients.filter((_recipient, index) => !removedIndices.has(index)),
    );

    // Selection collapses onto the chip just before the removed run, matching
    // how a text cursor lands after deleting a selection. That chip sits before
    // the lowest removed index, so it always survives the removal.
    const indexBeforeRemoved = Math.min(...selectedChipIndices) - 1;
    const keyBeforeRemoved = recipientKeys[indexBeforeRemoved];

    setChipSelection(
      keyBeforeRemoved === undefined
        ? null
        : {
            anchorKey: keyBeforeRemoved,
            focusKey: keyBeforeRemoved,
            keys: [keyBeforeRemoved],
          },
    );
  };

  const clearChipSelection = () => {
    setChipSelection(null);
  };

  const selectChipAtIndex = (chipIndex: number) => {
    setChipSelection(buildSelection(chipIndex, chipIndex));
  };

  const extendChipSelectionToIndex = (chipIndex: number) => {
    setChipSelection(
      buildSelection(selectionAnchorIndex ?? chipIndex, chipIndex),
    );
  };

  const toggleChipSelectionAtIndex = (chipIndex: number) => {
    const chipKey = recipientKeys[chipIndex];

    if (chipKey === undefined) {
      return;
    }

    setChipSelection((previousSelection) => {
      if (previousSelection === null) {
        return { anchorKey: chipKey, focusKey: chipKey, keys: [chipKey] };
      }

      const isAlreadySelected = previousSelection.keys.includes(chipKey);

      if (!isAlreadySelected) {
        // Adding re-anchors on the clicked chip so a following shift+click
        // ranges from where the user last pointed.
        return {
          anchorKey: chipKey,
          focusKey: chipKey,
          keys: [...previousSelection.keys, chipKey],
        };
      }

      const nextKeys = previousSelection.keys.filter((key) => key !== chipKey);

      if (nextKeys.length === 0) {
        return null;
      }

      // Removing must not leave the anchor or the cursor on a chip that is no
      // longer selected, or Enter and shift+arrow would act on it.
      const fallbackKey = nextKeys[nextKeys.length - 1];

      return {
        anchorKey:
          previousSelection.anchorKey === chipKey
            ? fallbackKey
            : previousSelection.anchorKey,
        focusKey:
          previousSelection.focusKey === chipKey
            ? fallbackKey
            : previousSelection.focusKey,
        keys: nextKeys,
      };
    });
  };

  const moveChipSelection = (direction: -1 | 1): number | null => {
    if (recipients.length === 0) {
      return null;
    }

    if (selectionFocusIndex === null) {
      if (direction === 1) {
        return null;
      }

      const lastIndex = recipients.length - 1;
      selectChipAtIndex(lastIndex);
      return lastIndex;
    }

    const nextIndex = selectionFocusIndex + direction;

    if (nextIndex >= recipients.length) {
      setChipSelection(null);
      return null;
    }

    const boundedIndex = Math.max(nextIndex, 0);
    selectChipAtIndex(boundedIndex);
    return boundedIndex;
  };

  const extendChipSelection = (direction: -1 | 1): number | null => {
    if (recipients.length === 0) {
      return null;
    }

    if (selectionFocusIndex === null || selectionAnchorIndex === null) {
      // Shift+Left out of the text input starts a selection on the last chip;
      // shift+Right has nowhere to go.
      if (direction === 1) {
        return null;
      }

      const lastIndex = recipients.length - 1;
      selectChipAtIndex(lastIndex);
      return lastIndex;
    }

    // Unlike a plain arrow, extending past the last chip keeps the selection
    // rather than dropping the caret back into the input.
    const nextFocusIndex = Math.min(
      Math.max(selectionFocusIndex + direction, 0),
      recipients.length - 1,
    );

    setChipSelection(buildSelection(selectionAnchorIndex, nextFocusIndex));

    return nextFocusIndex;
  };

  return {
    inputValue,
    setInputValue,
    editingIndex,
    isEditing,
    selectedChipIndices,
    selectionFocusIndex,
    chipFlash,
    commitInput,
    addRecipient,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeSelectedRecipients,
    clearChipSelection,
    selectChipAtIndex,
    extendChipSelectionToIndex,
    toggleChipSelectionAtIndex,
    moveChipSelection,
    extendChipSelection,
  };
};
