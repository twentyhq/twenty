import { isDefined } from 'twenty-shared/utils';

import { type FileInputHost } from '@/host/file-input/types/FileInputHost';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

const FILE_INPUT_ACTIVATION_TIMEOUT_MS = 1000;

export const createFileInputHost = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): FileInputHost => {
  let lastOwnedClickTime: number | undefined;

  const recordOwnedClick = (event: MouseEvent) => {
    const isOwnedTrustedClick =
      event.isTrusted &&
      isDefined(
        geometryTracker.findRemoteElementIdContainingNode(event.target),
      );

    if (isOwnedTrustedClick) {
      lastOwnedClickTime = performance.now();
    }
  };

  document.addEventListener('click', recordOwnedClick, true);

  return {
    openFilePicker: (remoteElementId) => {
      const hasRecentOwnedClick =
        isDefined(lastOwnedClickTime) &&
        performance.now() - lastOwnedClickTime <=
          FILE_INPUT_ACTIVATION_TIMEOUT_MS;

      if (!hasRecentOwnedClick) {
        return;
      }

      lastOwnedClickTime = undefined;
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
    dispose: () => {
      document.removeEventListener('click', recordOwnedClick, true);
    },
  };
};
