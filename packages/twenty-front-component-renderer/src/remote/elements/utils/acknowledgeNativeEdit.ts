import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { ACKNOWLEDGED_NATIVE_EDIT_SEQUENCE_BRIDGE_PROPERTY } from '@/constants/AcknowledgedNativeEditSequenceBridgeProperty';
import { acknowledgedNativeEditSequenceByRemoteElement } from '@/remote/elements/states/acknowledgedNativeEditSequenceByRemoteElement';

export const acknowledgeNativeEdit = ({
  remoteElement,
  nativeEditSequence,
}: {
  remoteElement: object;
  nativeEditSequence: number;
}): void => {
  acknowledgedNativeEditSequenceByRemoteElement.set(
    remoteElement,
    nativeEditSequence,
  );
  updateRemoteElementProperty(
    remoteElement as Element,
    ACKNOWLEDGED_NATIVE_EDIT_SEQUENCE_BRIDGE_PROPERTY,
    nativeEditSequence,
  );
};
