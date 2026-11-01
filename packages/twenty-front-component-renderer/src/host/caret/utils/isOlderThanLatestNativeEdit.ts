import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { latestNativeEditSequenceByHostElement } from '@/host/caret/states/latestNativeEditSequenceByHostElement';

export const isOlderThanLatestNativeEdit = ({
  hostElement,
  nativeEditSequence,
}: {
  hostElement: object | null;
  nativeEditSequence: unknown;
}): boolean => {
  if (!isDefined(hostElement)) {
    return false;
  }

  const latestNativeEditSequence =
    latestNativeEditSequenceByHostElement.get(hostElement);

  if (!isDefined(latestNativeEditSequence)) {
    return false;
  }

  if (!isNumber(nativeEditSequence)) {
    return true;
  }

  return nativeEditSequence < latestNativeEditSequence;
};
