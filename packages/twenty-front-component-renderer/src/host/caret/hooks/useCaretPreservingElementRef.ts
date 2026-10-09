import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useLayoutEffect, useRef, useState } from 'react';

import { hostInputValueSequenceStore } from '@/host/caret/states/hostInputValueSequenceStore';
import { createInputValueListenerRef } from '@/host/caret/utils/createInputValueListenerRef';
import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyNewInputSelectionCommands } from '@/host/caret/utils/applyNewInputSelectionCommands';
import { createInputSelectionListenerRef } from '@/host/caret/utils/createInputSelectionListenerRef';
import { createInputSelectionPublisher } from '@/host/caret/utils/createInputSelectionPublisher';
import { syncValuePreservingCaret } from '@/host/caret/utils/syncValuePreservingCaret';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const useCaretPreservingElementRef = ({
  composedElementRef,
  value,
  selectionCommands,
  onSelectionUpdate,
  inputValueSequence,
  shouldPreserveNativeEdits = true,
}: {
  composedElementRef: ElementRefCallback;
  value: unknown;
  selectionCommands?: unknown;
  onSelectionUpdate?: unknown;
  inputValueSequence?: unknown;
  shouldPreserveNativeEdits?: boolean;
}): ElementRefCallback => {
  const latestComposedElementRefRef = useRef(composedElementRef);
  latestComposedElementRefRef.current = composedElementRef;
  const latestOnSelectionUpdateRef = useRef(onSelectionUpdate);
  latestOnSelectionUpdateRef.current = onSelectionUpdate;
  const attachedElementRef = useRef<CaretPreservingElement | null>(null);
  const appliedSelectionSequenceRef = useRef(0);

  const [publishInputSelection] = useState(() =>
    createInputSelectionPublisher({
      attachedElementRef,
      latestOnSelectionUpdateRef,
      appliedSelectionSequenceRef,
    }),
  );

  const [caretPreservingElementRef] = useState(() => {
    const inputValueListenerRef = createInputValueListenerRef();
    const inputSelectionListenerRef = createInputSelectionListenerRef({
      onSelectionChange: () =>
        publishInputSelection({ shouldSkipUnchanged: false }),
    });

    return (element: Element | null) => {
      attachedElementRef.current = element as CaretPreservingElement | null;
      inputValueListenerRef(element);
      inputSelectionListenerRef(element);
      latestComposedElementRefRef.current(element);
    };
  });

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current;

    const latestInputValueSequence = isDefined(attachedElement)
      ? hostInputValueSequenceStore.read(attachedElement)
      : 0;
    const acknowledgedInputValueSequence = isNumber(inputValueSequence)
      ? inputValueSequence
      : 0;
    const hasPendingNativeEdit =
      shouldPreserveNativeEdits &&
      latestInputValueSequence > 0 &&
      acknowledgedInputValueSequence !== latestInputValueSequence;
    const didWriteValue =
      !hasPendingNativeEdit &&
      syncValuePreservingCaret({
        element: attachedElement,
        remoteValue: value,
      });

    applyNewInputSelectionCommands({
      element: attachedElement,
      selectionCommands,
      appliedSelectionSequenceRef,
      latestInputValueSequence,
    });

    publishInputSelection({ shouldSkipUnchanged: !didWriteValue });
  });

  return caretPreservingElementRef;
};
