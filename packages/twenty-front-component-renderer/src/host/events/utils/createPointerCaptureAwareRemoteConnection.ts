import { type RemoteConnection } from '@remote-dom/core/elements';
import { isInteger } from '@sniptt/guards';

import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

export const createPointerCaptureAwareRemoteConnection = ({
  connection,
  pointerCaptureController,
}: {
  connection: RemoteConnection;
  pointerCaptureController: HostPointerCaptureController;
}): RemoteConnection => ({
  mutate: connection.mutate,
  call: (remoteElementId, methodName, ...methodArguments) => {
    if (
      methodName !== 'setPointerCapture' &&
      methodName !== 'releasePointerCapture'
    ) {
      return connection.call(remoteElementId, methodName, ...methodArguments);
    }

    const [pointerId, captureToken] = methodArguments;

    if (!isInteger(pointerId) || !isInteger(captureToken)) {
      return;
    }

    const request = { remoteElementId, pointerId, captureToken };

    if (methodName === 'setPointerCapture') {
      pointerCaptureController.acceptWorkerPointerCapture(request);
      return;
    }

    pointerCaptureController.releaseWorkerPointerCapture(request);
  },
});
