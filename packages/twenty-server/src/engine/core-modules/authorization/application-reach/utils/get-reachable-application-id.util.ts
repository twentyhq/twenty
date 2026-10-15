import { assertUnreachable } from 'twenty-shared/utils';

import { type ApplicationReach } from 'src/engine/core-modules/authorization/application-reach/types/application-reach.type';
import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';

// undefined when every application's entities are reachable
export const getReachableApplicationId = ({
  reach,
  access,
}: {
  reach: ApplicationReach;
  access: ApplicationTargetAccess;
}): string | undefined => {
  switch (reach.kind) {
    case 'workspace':
      return undefined;
    case 'composer':
      return access === 'manage' ? reach.applicationId : undefined;
    case 'confined':
      return reach.applicationId;
    default:
      return assertUnreachable(reach);
  }
};
