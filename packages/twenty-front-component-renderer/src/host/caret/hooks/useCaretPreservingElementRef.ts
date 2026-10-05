import {
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';
import { useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { applyInputSelectionRequest } from '@/host/caret/utils/applyInputSelectionRequest';
import { syncValuePreservingCaret } from '@/host/caret/utils/syncValuePreservingCaret';
import { readInputSelectionState } from '@/utils/readInputSelectionState';

const INPUT_SELECTION_EVENT_TYPES = ['select', 'selectionchange', 'input'];

export const useCaretPreservingElementRef = ({
  composedElementRef,
  value,
  selectionRequest,
  onSelectionUpdate,
}: {
  composedElementRef: ElementRefCallback;
  value: unknown;
  selectionRequest?: unknown;
  onSelectionUpdate?: unknown;
}): ElementRefCallback => {
  const latestComposedElementRefRef = useRef(composedElementRef);
  latestComposedElementRefRef.current = composedElementRef;
  const attachedElementRef = useRef<Element | null>(null);
  const appliedSelectionSequenceRef = useRef(0);

  const [caretPreservingElementRef] = useState(
    () => (element: Element | null) => {
      attachedElementRef.current = element;
      latestComposedElementRefRef.current(element);
    },
  );

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!isDefined(attachedElement)) {
      return;
    }
    if (isString(value) || isNumber(value)) {
      syncValuePreservingCaret({
        element: attachedElement,
        nextValue: String(value),
      });
    }
    const commands = isArray(selectionRequest) ? selectionRequest : [];
    for (const command of commands) {
      if (!isObject(command)) {
        continue;
      }
      const { sequence, request } = command as Record<string, unknown>;
      if (
        !isNumber(sequence) ||
        sequence <= appliedSelectionSequenceRef.current
      ) {
        continue;
      }
      appliedSelectionSequenceRef.current = sequence;
      applyInputSelectionRequest({ element: attachedElement, request });
    }
    if (isFunction(onSelectionUpdate)) {
      onSelectionUpdate({
        ...readInputSelectionState(attachedElement),
        selectionCommandSequence: appliedSelectionSequenceRef.current,
      });
    }
  });

  useLayoutEffect(() => {
    const element = attachedElementRef.current;
    if (!isDefined(element) || !isFunction(onSelectionUpdate)) {
      return;
    }
    const publishSelection = () =>
      onSelectionUpdate({
        ...readInputSelectionState(element),
        selectionCommandSequence: appliedSelectionSequenceRef.current,
      });
    for (const eventType of INPUT_SELECTION_EVENT_TYPES) {
      element.addEventListener(eventType, publishSelection);
    }
    return () => {
      for (const eventType of INPUT_SELECTION_EVENT_TYPES) {
        element.removeEventListener(eventType, publishSelection);
      }
    };
  }, [onSelectionUpdate]);

  return caretPreservingElementRef;
};
