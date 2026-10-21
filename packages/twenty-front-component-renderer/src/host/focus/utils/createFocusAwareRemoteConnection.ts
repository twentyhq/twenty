import { type RemoteConnection } from '@remote-dom/core/elements';

import { type HostFocusController } from '@/host/focus/types/HostFocusController';

export const createFocusAwareRemoteConnection = ({
  connection,
  hostFocusController,
}: {
  connection: RemoteConnection;
  hostFocusController: HostFocusController;
}): RemoteConnection => ({
  mutate: connection.mutate,
  call: (remoteElementId, methodName, ...methodArguments) => {
    if (methodName === 'focus' || methodName === 'blur') {
      hostFocusController.callFocusMethod({
        remoteElementId,
        methodName,
        options: methodArguments[0] as FocusOptions | undefined,
      });
      return;
    }

    return connection.call(remoteElementId, methodName, ...methodArguments);
  },
});
