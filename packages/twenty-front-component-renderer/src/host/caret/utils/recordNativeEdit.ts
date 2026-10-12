import { lastNativeEditSequenceAcrossHostElements } from '@/host/caret/states/lastNativeEditSequenceAcrossHostElements';
import { latestNativeEditSequenceByHostElement } from '@/host/caret/states/latestNativeEditSequenceByHostElement';

export const recordNativeEdit = (hostElement: object): void => {
  lastNativeEditSequenceAcrossHostElements.current += 1;
  latestNativeEditSequenceByHostElement.set(
    hostElement,
    lastNativeEditSequenceAcrossHostElements.current,
  );
};
