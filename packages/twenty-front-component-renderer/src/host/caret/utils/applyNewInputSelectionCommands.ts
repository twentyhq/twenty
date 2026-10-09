import { isArray, isNumber } from '@sniptt/guards';
import { type RefObject } from 'react';
import { isPlainObject } from 'twenty-shared/utils';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyInputSelectionRequest } from '@/host/caret/utils/applyInputSelectionRequest';

export const applyNewInputSelectionCommands = ({
  element,
  selectionCommands,
  appliedSelectionSequenceRef,
  latestInputValueSequence = 0,
}: {
  element: CaretPreservingElement | null;
  selectionCommands: unknown;
  appliedSelectionSequenceRef: RefObject<number>;
  latestInputValueSequence?: number;
}): void => {
  if (!isArray(selectionCommands)) {
    return;
  }

  for (const selectionCommand of selectionCommands) {
    if (!isPlainObject(selectionCommand)) {
      continue;
    }

    const { sequence, request, inputValueSequence = 0 } = selectionCommand;

    if (
      !isNumber(sequence) ||
      sequence <= appliedSelectionSequenceRef.current
    ) {
      continue;
    }

    appliedSelectionSequenceRef.current = sequence;
    const isStaleInputSelection =
      isNumber(inputValueSequence) &&
      inputValueSequence < latestInputValueSequence;

    if (isStaleInputSelection) {
      continue;
    }

    applyInputSelectionRequest({ element, request });
  }
};
