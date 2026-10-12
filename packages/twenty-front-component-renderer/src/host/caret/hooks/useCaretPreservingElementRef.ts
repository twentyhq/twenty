import { useLayoutEffect, useRef, useState } from 'react';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { applyNewInputSelectionCommands } from '@/host/caret/utils/applyNewInputSelectionCommands';
import { createInputSelectionListenerRef } from '@/host/caret/utils/createInputSelectionListenerRef';
import { createInputSelectionPublisher } from '@/host/caret/utils/createInputSelectionPublisher';
import { createNativeEditListenerRef } from '@/host/caret/utils/createNativeEditListenerRef';
import { isOlderThanLatestNativeEdit } from '@/host/caret/utils/isOlderThanLatestNativeEdit';
import { syncValuePreservingCaret } from '@/host/caret/utils/syncValuePreservingCaret';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const useCaretPreservingElementRef = ({
  composedElementRef,
  value,
  selectionCommands,
  onSelectionUpdate,
  acknowledgedNativeEditSequence,
  shouldPreserveNativeEdits,
}: {
  composedElementRef: ElementRefCallback;
  value: unknown;
  selectionCommands?: unknown;
  onSelectionUpdate?: unknown;
  acknowledgedNativeEditSequence?: unknown;
  shouldPreserveNativeEdits: boolean;
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
    const nativeEditListenerRef = createNativeEditListenerRef();
    const inputSelectionListenerRef = createInputSelectionListenerRef({
      onSelectionChange: () =>
        publishInputSelection({ shouldSkipUnchanged: false }),
    });

    return (element: Element | null) => {
      attachedElementRef.current = element as CaretPreservingElement | null;
      nativeEditListenerRef(element);
      inputSelectionListenerRef(element);
      latestComposedElementRefRef.current(element);
    };
  });

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current;

    const isRemoteValueOlderThanLatestNativeEdit =
      shouldPreserveNativeEdits &&
      isOlderThanLatestNativeEdit({
        hostElement: attachedElement,
        nativeEditSequence: acknowledgedNativeEditSequence,
      });

    const didWriteValue =
      !isRemoteValueOlderThanLatestNativeEdit &&
      syncValuePreservingCaret({
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
