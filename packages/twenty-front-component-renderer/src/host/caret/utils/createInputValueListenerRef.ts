import { hostInputValueSequenceStore } from '@/host/caret/states/hostInputValueSequenceStore';
import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

const recordNativeEdit = (event: Event) => {
  hostInputValueSequenceStore.recordEdit(
    event.currentTarget as CaretPreservingElement,
  );
};

export const createInputValueListenerRef = (): ElementRefCallback => {
  let attachedElement: Element | null = null;

  return (element) => {
    attachedElement?.removeEventListener('input', recordNativeEdit, true);
    element?.addEventListener('input', recordNativeEdit, true);
    attachedElement = element;
  };
};
