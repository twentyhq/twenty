import { isDefined } from 'twenty-shared/utils';

import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

const FILE_INPUT_ACTIVATION_TIMEOUT_MS = 1000;

export const createFileInputHost = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}) => {
  let pendingActivationId: string | undefined;
  let activationTimeout: ReturnType<typeof setTimeout> | undefined;

  const reset = () => {
    clearTimeout(activationTimeout);
    pendingActivationId = undefined;
  };

  return {
    reset,
    captureActivation: (event: Event): string | undefined => {
      const isOwnedTarget = isDefined(
        geometryTracker.findRemoteElementIdContainingNode(event.target),
      );
      const isTrustedClick = event.type === 'click' && event.isTrusted;

      if (
        !isTrustedClick ||
        !isOwnedTarget ||
        !navigator.userActivation?.isActive
      ) {
        return undefined;
      }

      reset();
      pendingActivationId = crypto.randomUUID();
      activationTimeout = setTimeout(reset, FILE_INPUT_ACTIVATION_TIMEOUT_MS);
      return pendingActivationId;
    },
    openFilePicker: ({
      remoteElementId,
      activationId,
    }: {
      remoteElementId: string;
      activationId: unknown;
    }): void => {
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
