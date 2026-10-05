import { isArray, isNumber, isObject, isString } from '@sniptt/guards';
import { useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { applyInputSelectionRequest } from '@/host/caret/utils/applyInputSelectionRequest';
import { createInputSelectionListenerRef } from '@/host/caret/utils/createInputSelectionListenerRef';
import { createInputSelectionPublisher } from '@/host/caret/utils/createInputSelectionPublisher';
import { syncValuePreservingCaret } from '@/host/caret/utils/syncValuePreservingCaret';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

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
  const latestOnSelectionUpdateRef = useRef(onSelectionUpdate);
  latestOnSelectionUpdateRef.current = onSelectionUpdate;
  const attachedElementRef = useRef<CaretPreservingElement | null>(null);
  const appliedSelectionSequenceRef = useRef(0);

  const [{ caretPreservingElementRef, publishSelection }] = useState(() => {
    const publishInputSelection = createInputSelectionPublisher({
      attachedElementRef,
      latestOnSelectionUpdateRef,
      appliedSelectionSequenceRef,
    });
    const inputSelectionListenerRef = createInputSelectionListenerRef({
      onSelectionChange: () =>
        publishInputSelection({ shouldSkipUnchanged: false }),
    });

    return {
      publishSelection: publishInputSelection,
      caretPreservingElementRef: (element: Element | null) => {
        attachedElementRef.current = element as CaretPreservingElement | null;
        inputSelectionListenerRef(element);
        latestComposedElementRefRef.current(element);
      },
    };
  });

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current;
    const didWriteValue =
      isDefined(attachedElement) &&
      (isString(value) || isNumber(value)) &&
      syncValuePreservingCaret({
        element: attachedElement,
        nextValue: String(value),
      });
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
    publishSelection({ shouldSkipUnchanged: !didWriteValue });
  });

  return caretPreservingElementRef;
};
