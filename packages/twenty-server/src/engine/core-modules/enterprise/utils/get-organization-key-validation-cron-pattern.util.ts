import { createHash } from 'crypto';

import { ENTERPRISE_KEY_VALIDATION_CRON_PATTERN } from 'src/engine/core-modules/enterprise/constants/organization-key-validation-cron-pattern.constant';

const MINUTES_PER_HOUR = 60;

export const getOrganizationKeyValidationCronPattern = (
  serverId: string | null,
): string => {
  if (serverId === null) {
    return ENTERPRISE_KEY_VALIDATION_CRON_PATTERN;
  }

  const minute =
    createHash('sha256').update(serverId).digest().readUInt32BE(0) %
    MINUTES_PER_HOUR;

  return `${minute} 4 * * *`;
};
