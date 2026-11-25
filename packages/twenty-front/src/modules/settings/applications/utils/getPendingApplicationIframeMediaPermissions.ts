import { type IframeMediaPermission } from 'twenty-shared/types';

export const getPendingApplicationIframeMediaPermissions = ({
  requestedPermissions,
  grantedPermissions,
}: {
  requestedPermissions: readonly IframeMediaPermission[];
  grantedPermissions: readonly IframeMediaPermission[];
}): IframeMediaPermission[] =>
  requestedPermissions.flatMap(({ origin, microphone, camera }) => {
    const grantedPermission = grantedPermissions.find(
      (permission) => permission.origin === origin,
    );
    const isMicrophonePending = microphone && !grantedPermission?.microphone;
    const isCameraPending = camera && !grantedPermission?.camera;

    return isMicrophonePending || isCameraPending
      ? [
          {
            origin,
            microphone: isMicrophonePending,
            camera: isCameraPending,
          },
        ]
      : [];
  });
