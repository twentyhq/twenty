import { isDefined } from 'twenty-sdk/utils';

import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';

export type GranolaLiveSyncState = 'active' | 'paused' | 'unregistered';

export const getGranolaLiveSyncState = (
  status: Pick<GranolaConnectionStatus, 'registration'>,
): GranolaLiveSyncState => {
  if (!isDefined(status.registration)) {
    return 'unregistered';
  }

  return status.registration.isActive ? 'active' : 'paused';
};
