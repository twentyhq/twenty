import { isDefined } from 'twenty-sdk/utils';

import { type GranolaConnectionState } from 'src/front-components/types/granola-connection-state.type';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { isGranolaConnectionReady } from 'src/front-components/utils/is-granola-connection-ready.util';

export const computeGranolaConnectionState = ({
  status,
  isConnecting,
  hasSetupFailed,
}: {
  status: Pick<
    GranolaConnectionStatus,
    | 'isConnected'
    | 'isGranolaReachable'
    | 'needsRegistration'
    | 'registration'
    | 'error'
  >;
  isConnecting: boolean;
  hasSetupFailed: boolean;
}): GranolaConnectionState => {
  if (isConnecting) {
    return 'CONNECTING';
  }

  if (!status.isGranolaReachable) {
    return 'UNREACHABLE';
  }

  if (!status.isConnected) {
    return 'INVALID_KEY';
  }

  if (hasSetupFailed) {
    return 'SETUP_INCOMPLETE';
  }

  if (isGranolaConnectionReady(status)) {
    return 'CONNECTED';
  }

  if (isDefined(status.registration) && !status.registration.isActive) {
    return 'PAUSED';
  }

  return 'SETUP_INCOMPLETE';
};
