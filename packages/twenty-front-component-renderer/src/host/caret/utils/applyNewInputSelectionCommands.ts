import { isArray, isNumber } from '@sniptt/guards';
import { type RefObject } from 'react';
import { isPlainObject } from 'twenty-shared/utils';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyInputSelectionRequest } from '@/host/caret/utils/applyInputSelectionRequest';

export const applyNewInputSelectionCommands = ({
  element,
  selectionCommands,
  appliedSelectionSequenceRef,
  latestInputValueSequence,
}: {
  element: CaretPreservingElement | null;
  selectionCommands: unknown;
  appliedSelectionSequenceRef: RefObject<number>;
  latestInputValueSequence: number;
}): void => {
  if (!isArray(selectionCommands)) {
    return;
  }

  for (const selectionCommand of selectionCommands) {
    if (!isPlainObject(selectionCommand)) {
      continue;
    }

    const { sequence, request, inputValueSequence } = selectionCommand;

    if (
      !isNumber(sequence) ||
      sequence <= appliedSelectionSequenceRef.current
    ) {
      continue;
    }

    appliedSelectionSequenceRef.current = sequence;
    const commandInputValueSequence = isNumber(inputValueSequence)
      ? inputValueSequence
      : 0;

    if (commandInputValueSequence < latestInputValueSequence) {
      continue;
    }

    applyInputSelectionRequest({ element, request });
  }
};
