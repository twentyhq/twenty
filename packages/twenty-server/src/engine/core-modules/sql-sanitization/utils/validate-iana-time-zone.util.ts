import { IANA_TIME_ZONES } from 'twenty-shared/constants';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';

const VALID_IANA_TIMEZONES = new Set(IANA_TIME_ZONES);

export const validateIanaTimeZone = (timeZone: string): void => {
  if (VALID_IANA_TIMEZONES.has(timeZone)) {
    return;
  }

  throw new CommonQueryRunnerException(
    `Invalid timezone: ${timeZone}`,
    CommonQueryRunnerExceptionCode.INVALID_TIMEZONE,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};
