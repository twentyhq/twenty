import { hostInputValueSequenceStore } from '@/host/caret/states/hostInputValueSequenceStore';
import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

const NATIVE_EDIT_EVENT_TYPES = ['input', 'change'];

const recordNativeEdit = (event: Event) => {
  hostInputValueSequenceStore.recordEdit({
    element: event.currentTarget as CaretPreservingElement,
    shouldSkipUnchangedValue: event.type === 'change',
  });
};

export const createInputValueListenerRef = (): ElementRefCallback => {
  let attachedElement: Element | null = null;

  return (element) => {
    for (const eventType of NATIVE_EDIT_EVENT_TYPES) {
      attachedElement?.removeEventListener(eventType, recordNativeEdit, true);
      element?.addEventListener(eventType, recordNativeEdit, true);
    }

    attachedElement = element;
  };
};
