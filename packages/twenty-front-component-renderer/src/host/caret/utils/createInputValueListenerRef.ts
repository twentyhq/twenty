import { isDefined } from 'twenty-shared/utils';

import { hostInputValueSequenceStore } from '@/host/caret/states/hostInputValueSequenceStore';
import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const createInputValueListenerRef = (): ElementRefCallback => {
  let attachedElement: CaretPreservingElement | null = null;

  const handleInput = () => {
    if (!isDefined(attachedElement)) {
      return;
    }

    hostInputValueSequenceStore.recordEdit({
      element: attachedElement,
      shouldSkipUnchangedValue: false,
    });
  };

  const handleChange = () => {
    if (!isDefined(attachedElement)) {
      return;
    }

    hostInputValueSequenceStore.recordEdit({
      element: attachedElement,
      shouldSkipUnchangedValue: true,
    });
  };

  return (element) => {
    attachedElement?.removeEventListener('input', handleInput, true);
    attachedElement?.removeEventListener('change', handleChange, true);
    attachedElement = element as CaretPreservingElement | null;
    attachedElement?.addEventListener('input', handleInput, true);
    attachedElement?.addEventListener('change', handleChange, true);
  };
};
