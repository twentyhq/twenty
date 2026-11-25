import { t } from '@lingui/core/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { getUrlSafely } from 'twenty-shared/utils';
import { IconFrame } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';

const getIframeMediaPermissionLabel = ({
  origin,
  microphone,
  camera,
}: IframeMediaPermission) => {
  const host = getUrlSafely(origin)?.host ?? origin;

  if (microphone && camera) {
    return t`Let ${host} use your microphone and camera`;
  }

  if (camera) {
    return t`Let ${host} use your camera`;
  }

  return t`Let ${host} use your microphone`;
};

export const buildApplicationIframeMediaPermissionSummary = (
  iframeMediaPermissions: readonly IframeMediaPermission[],
): PermissionSummaryItem[] =>
  iframeMediaPermissions.map((iframeMediaPermission) => ({
    Icon: IconFrame,
    label: getIframeMediaPermissionLabel(iframeMediaPermission),
  }));
