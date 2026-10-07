import { useLayoutEffect, useRef, useState } from 'react';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyNewInputSelectionCommands } from '@/host/caret/utils/applyNewInputSelectionCommands';
import { createInputSelectionListenerRef } from '@/host/caret/utils/createInputSelectionListenerRef';
import { createInputSelectionPublisher } from '@/host/caret/utils/createInputSelectionPublisher';
import { syncRemoteValuePreservingCaret } from '@/host/caret/utils/syncRemoteValuePreservingCaret';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const useCaretPreservingElementRef = ({
  composedElementRef,
  value,
  selectionCommands,
  onSelectionUpdate,
}: {
  composedElementRef: ElementRefCallback;
  value: unknown;
  selectionCommands?: unknown;
  onSelectionUpdate?: unknown;
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
    const inputSelectionListenerRef = createInputSelectionListenerRef({
      onSelectionChange: () =>
        publishInputSelection({ shouldSkipUnchanged: false }),
    });

    return (element: Element | null) => {
      attachedElementRef.current = element as CaretPreservingElement | null;
      inputSelectionListenerRef(element);
      latestComposedElementRefRef.current(element);
    };
  });

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current;

    const didWriteValue = syncRemoteValuePreservingCaret({
      element: attachedElement,
      remoteValue: value,
    });

    applyNewInputSelectionCommands({
      element: attachedElement,
      selectionCommands,
      appliedSelectionSequenceRef,
    });

    publishInputSelection({ shouldSkipUnchanged: !didWriteValue });
  });

  return caretPreservingElementRef;
};
