import { isDefined } from 'twenty-shared/utils';

import { type ApplicationCallerAccess } from 'src/engine/core-modules/application/types/application-caller-access.type';
import { getReachableApplicationId } from 'src/engine/core-modules/application/utils/get-reachable-application-id.util';

export const canCallerReachApplication = ({
  applicationId,
  ...callerAccess
}: ApplicationCallerAccess & {
  applicationId: string | null | undefined;
}): boolean => {
  const reachableApplicationId = getReachableApplicationId(callerAccess);

  return (
    !isDefined(reachableApplicationId) ||
    reachableApplicationId === applicationId
  );
};
