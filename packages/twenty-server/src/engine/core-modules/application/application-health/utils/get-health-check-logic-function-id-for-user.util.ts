import { isDefined } from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const getHealthCheckLogicFunctionIdForUser = ({
  healthCheckLogicFunctionId,
  isUserHealthCheckEnabled,
}: Partial<
  Pick<
    ApplicationEntity,
    'healthCheckLogicFunctionId' | 'isUserHealthCheckEnabled'
  >
>): string | null => {
  if (!isUserHealthCheckEnabled || !isDefined(healthCheckLogicFunctionId)) {
    return null;
  }

  return healthCheckLogicFunctionId;
};
