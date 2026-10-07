import { type RemoteConnection } from '@remote-dom/core/elements';
import { CustomError } from 'twenty-shared/utils';

import { type HostFocusController } from '@/host/focus/types/HostFocusController';

export const createFocusAwareRemoteConnection = ({
  connection,
  hostFocusController,
}: {
  connection: Pick<RemoteConnection, 'mutate'>;
  hostFocusController: HostFocusController;
}): RemoteConnection => ({
  mutate: connection.mutate,
  call: (remoteElementId, methodName, ...methodArguments) => {
    if (methodName !== 'focus' && methodName !== 'blur') {
      throw new CustomError(
        `Front components cannot call ${methodName}() on host elements`,
        'FRONT_COMPONENT_HOST_METHOD_NOT_ALLOWED',
      );
    }

    hostFocusController.callFocusMethod({
      remoteElementId,
      methodName,
      options: methodArguments[0] as FocusOptions | undefined,
    });
  },
});
