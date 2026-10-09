import { isDefined } from 'twenty-shared/utils';

import { type FileInputHost } from '@/host/file-input/types/FileInputHost';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { generateRandomId } from '@/utils/generateRandomId';

const FILE_INPUT_ACTIVATION_TIMEOUT_MS = 1000;

export const createFileInputHost = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): FileInputHost => {
  let pendingActivationId: string | undefined;
  let activationTimeout: ReturnType<typeof setTimeout> | undefined;

  const reset = () => {
    clearTimeout(activationTimeout);
    pendingActivationId = undefined;
  };

  return {
    reset,
    captureActivation: (event) => {
      const isTrustedClick = event.type === 'click' && event.isTrusted;

      if (!isTrustedClick || !navigator.userActivation?.isActive) {
        return undefined;
      }

      const isOwnedTarget = isDefined(
        geometryTracker.findRemoteElementIdContainingNode(event.target),
      );

      if (!isOwnedTarget) {
        return undefined;
      }

      reset();
      pendingActivationId = generateRandomId();
      activationTimeout = setTimeout(reset, FILE_INPUT_ACTIVATION_TIMEOUT_MS);
      return pendingActivationId;
    },
    openFilePicker: ({ remoteElementId, activationId }) => {
      const hasMatchingActivation =
        isDefined(pendingActivationId) && pendingActivationId === activationId;

      if (!hasMatchingActivation) {
        return;
      }

      reset();
      const input = geometryTracker.getRegisteredNode(remoteElementId);

      if (
        !(input instanceof HTMLInputElement) ||
        input.type !== 'file' ||
        input.matches(':disabled') ||
        !input.isConnected ||
        !navigator.userActivation?.isActive
      ) {
        return;
      }

      input.click();
    },
  };
};
