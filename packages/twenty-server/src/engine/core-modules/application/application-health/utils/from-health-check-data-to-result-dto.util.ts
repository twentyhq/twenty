import {
  ApplicationHealthStatus,
  isApplicationHealthCheckResult,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';

export const UNKNOWN_HEALTH_CHECK_RESULT: ApplicationHealthCheckResultDTO = {
  status: ApplicationHealthStatus.UNKNOWN,
  title: null,
  description: null,
  action: null,
};

export const fromHealthCheckDataToResultDto = (
  data: unknown,
): ApplicationHealthCheckResultDTO => {
  if (!isApplicationHealthCheckResult(data)) {
    return UNKNOWN_HEALTH_CHECK_RESULT;
  }

  if (data.status === ApplicationHealthStatus.OK) {
    return {
      status: ApplicationHealthStatus.OK,
      title: null,
      description: null,
      action: null,
    };
  }

  const { action } = data;

  return {
    status: ApplicationHealthStatus[data.status],
    title: data.title,
    description: data.description ?? null,
    action: isDefined(action)
      ? { label: action.label, location: action.location ?? null }
      : null,
  };
};
