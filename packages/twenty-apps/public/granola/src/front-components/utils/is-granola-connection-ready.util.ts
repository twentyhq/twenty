import { isDefined } from 'twenty-sdk/utils';

import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';

export const isGranolaConnectionReady = (
  status: Pick<
    GranolaConnectionStatus,
    | 'isConnected'
    | 'isGranolaReachable'
    | 'needsRegistration'
    | 'registration'
    | 'error'
  >,
): boolean =>
  status.isConnected &&
  status.isGranolaReachable &&
  !status.needsRegistration &&
  !isDefined(status.error) &&
  (status.registration?.isActive ?? false);
