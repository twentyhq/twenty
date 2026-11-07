import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { OFFLOADED_JOB_PAYLOAD_KEY } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload-key.constant';
import { type OffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload.type';

export const isOffloadedJobPayload = (
  data: unknown,
): data is OffloadedJobPayload => {
  if (!isPlainObject(data) || Object.keys(data).length !== 1) {
    return false;
  }

  const reference = data[OFFLOADED_JOB_PAYLOAD_KEY];

  return (
    isPlainObject(reference) &&
    isNonEmptyString(reference.path) &&
    isNumber(reference.sizeBytes) &&
    isNonEmptyString(reference.sha256)
  );
};
