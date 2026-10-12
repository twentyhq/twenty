import { type RemoteConnection } from '@remote-dom/core/elements';
import { isFunction, isInteger } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { createCapturedPointerEventForwarder } from '@/host/events/utils/createCapturedPointerEventForwarder';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';

type PointerCaptureSubscription = { pointerId: number; dispose: () => void };

export const createPointerCaptureAwareRemoteConnection = ({
  connection,
  geometryTracker,
}: {
  connection: RemoteConnection;
  geometryTracker: GeometryTracker;
}): { connection: RemoteConnection; dispose: () => void } => {
  const subscriptions = new Map<string, PointerCaptureSubscription>();

  return {
    connection: {
      mutate: connection.mutate,
      call: (remoteElementId, methodName, ...methodArguments) => {
        const isPointerCaptureMethod =
          methodName === 'setPointerCapture' ||
          methodName === 'releasePointerCapture';

        if (!isPointerCaptureMethod) {
          return connection.call(
            remoteElementId,
            methodName,
            ...methodArguments,
          );
        }

        const pointerId = methodArguments[0];

        if (!isInteger(pointerId)) {
          return;
        }

        const element = geometryTracker.getRegisteredNode(remoteElementId);
        const subscription = subscriptions.get(remoteElementId);

        if (methodName === 'releasePointerCapture') {
          if (subscription?.pointerId === pointerId) {
            subscription.dispose();
          }

          if (
            isDefined(element) &&
            element.isConnected &&
            element.hasPointerCapture(pointerId)
          ) {
            element.releasePointerCapture(pointerId);
          }
          return;
        }

        if (
          !isDefined(element) ||
          !element.isConnected ||
          !element.hasPointerCapture(pointerId)
        ) {
          return;
        }

        const forwardEvent = methodArguments[1];

        if (!isFunction<RemoteSerializedEventListener, unknown>(forwardEvent)) {
          return;
        }

        subscription?.dispose();
        const dispose = createCapturedPointerEventForwarder({
          element,
          pointerId,
          forwardEvent,
          eventOwner: geometryTracker.findRemoteElementIdContainingNode,
          onDispose: () => {
            if (subscriptions.get(remoteElementId)?.dispose === dispose) {
              subscriptions.delete(remoteElementId);
            }
          },
        });

        subscriptions.set(remoteElementId, { pointerId, dispose });
      },
    },
    dispose: () => {
      for (const subscription of subscriptions.values()) {
        subscription.dispose();
      }
      subscriptions.clear();
    },
  };
};
