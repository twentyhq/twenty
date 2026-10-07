import { isNumber, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type CaretPreservingElement } from '@/host/caret/types/CaretPreservingElement';
import { syncValuePreservingCaret } from '@/host/caret/utils/syncValuePreservingCaret';

export const syncRemoteValuePreservingCaret = ({
  element,
  remoteValue,
}: {
  element: CaretPreservingElement | null;
  remoteValue: unknown;
}): boolean => {
  if (!isDefined(element)) {
    return false;
  }

  if (!isString(remoteValue) && !isNumber(remoteValue)) {
    return false;
  }

  return syncValuePreservingCaret({
    element,
    nextValue: String(remoteValue),
  });
};
