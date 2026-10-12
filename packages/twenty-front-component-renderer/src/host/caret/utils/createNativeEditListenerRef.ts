import { isDefined } from 'twenty-shared/utils';

import { recordNativeEdit } from '@/host/caret/utils/recordNativeEdit';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

const NATIVE_EDIT_EVENT_TYPE = 'input';

const recordNativeEditOnCurrentTarget = ({ currentTarget }: Event): void => {
  if (!isDefined(currentTarget)) {
    return;
  }

  recordNativeEdit(currentTarget);
};

export const createNativeEditListenerRef = (): ElementRefCallback => {
  let attachedElement: Element | null = null;

  return (element) => {
    attachedElement?.removeEventListener(
      NATIVE_EDIT_EVENT_TYPE,
      recordNativeEditOnCurrentTarget,
    );
    element?.addEventListener(
      NATIVE_EDIT_EVENT_TYPE,
      recordNativeEditOnCurrentTarget,
    );
    attachedElement = element;
  };
};
