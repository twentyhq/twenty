import { createHash } from 'crypto';

import { ENTERPRISE_KEY_VALIDATION_CRON_PATTERN } from 'src/engine/core-modules/enterprise/constants/organization-key-validation-cron-pattern.constant';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

// Sentry crontab schedules have no seconds field; BullMQ accepts one.
export const getOrganizationKeyValidationCronPattern = (
  serverId: string | null,
  { withSeconds }: { withSeconds: boolean } = { withSeconds: true },
): string => {
  if (serverId === null) {
    return ENTERPRISE_KEY_VALIDATION_CRON_PATTERN;
  }

  const offsetInDay =
    createHash('sha256').update(serverId).digest().readUInt32BE(0) %
    SECONDS_PER_DAY;

  const hour = Math.floor(offsetInDay / SECONDS_PER_HOUR);
  const minute = Math.floor(
    (offsetInDay % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const second = offsetInDay % SECONDS_PER_MINUTE;

  return withSeconds
    ? `${second} ${minute} ${hour} * * *`
    : `${minute} ${hour} * * *`;
};
