import { isArray, isNumber, isObject } from '@sniptt/guards';
import { type RefObject } from 'react';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyInputSelectionRequest } from '@/host/caret/utils/applyInputSelectionRequest';

export const applyNewInputSelectionCommands = ({
  element,
  selectionCommands,
  appliedSelectionSequenceRef,
}: {
  element: CaretPreservingElement | null;
  selectionCommands: unknown;
  appliedSelectionSequenceRef: RefObject<number>;
}): void => {
  if (!isArray(selectionCommands)) {
    return;
  }

  for (const selectionCommand of selectionCommands) {
    if (!isObject(selectionCommand)) {
      continue;
    }

    const { sequence, request } = selectionCommand as Record<string, unknown>;

    if (
      !isNumber(sequence) ||
      sequence <= appliedSelectionSequenceRef.current
    ) {
      continue;
    }

    appliedSelectionSequenceRef.current = sequence;
    applyInputSelectionRequest({ element, request });
  }
};
