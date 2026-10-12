import { isDefined } from 'twenty-shared/utils';

import { acknowledgedNativeEditSequenceByRemoteElement } from '@/remote/elements/states/acknowledgedNativeEditSequenceByRemoteElement';

export const isNativeEditAcknowledged = ({
  remoteElement,
  nativeEditSequence,
}: {
  remoteElement: object;
  nativeEditSequence: number;
}): boolean => {
  const acknowledgedNativeEditSequence =
    acknowledgedNativeEditSequenceByRemoteElement.get(remoteElement);

  if (!isDefined(acknowledgedNativeEditSequence)) {
    return false;
  }

  return nativeEditSequence <= acknowledgedNativeEditSequence;
};
