import { t } from '@lingui/core/macro';
import {
  type ApplicationCapability,
  isApplicationCapability,
} from 'twenty-shared/application';
import { IconMicrophone, IconVideo } from 'twenty-ui/icon';

import { type PermissionSummaryItem } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

const buildApplicationCapabilityItem = (
  capability: ApplicationCapability,
): PermissionSummaryItem => {
  if (capability === 'camera') {
    return { Icon: IconVideo, label: t`Use your camera` };
  }

  return { Icon: IconMicrophone, label: t`Use your microphone` };
};

export const buildApplicationCapabilitySummary = (
  requestedCapabilities: string[],
): PermissionSummaryItem[] =>
  requestedCapabilities
    .filter(isApplicationCapability)
    .map(buildApplicationCapabilityItem);
