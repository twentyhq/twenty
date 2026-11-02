import { type IframeMediaPermission } from 'twenty-shared/types';

export const upsertIframeMediaPermission = ({
  permissions,
  permission,
}: {
  permissions: IframeMediaPermission[];
  permission: IframeMediaPermission;
}): IframeMediaPermission[] => {
  if (!permission.microphone && !permission.camera) {
    return permissions.filter(
      (existingPermission) => existingPermission.origin !== permission.origin,
    );
  }

  const isConfiguredOrigin = permissions.some(
    (existingPermission) => existingPermission.origin === permission.origin,
  );

  if (!isConfiguredOrigin) {
    return [...permissions, permission];
  }

  return permissions.map((existingPermission) =>
    existingPermission.origin === permission.origin
      ? permission
      : existingPermission,
  );
};
