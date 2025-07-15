import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';

import { NEVER_EXPIRE_DELTA_IN_YEARS } from '@/settings/developers/constants/NeverExpireDeltaInYears';
import { beautifyDateDiff } from '~/utils/date-utils';

export const doesNeverExpire = (expiresAt: string) => {
  const dateDiff = DateTime.fromISO(expiresAt).diff(DateTime.now(), [
    'years',
    'days',
  ]);
  return dateDiff.years > NEVER_EXPIRE_DELTA_IN_YEARS / 10;
};

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention = false,
  short = true,
) => {
  if (!isNonEmptyString(expiresAt) || doesNeverExpire(expiresAt)) {
    return withExpiresMention ? 'Never expires' : 'Never';
  }
  const dateDiff = beautifyDateDiff(expiresAt, undefined, short);
  if (dateDiff.includes('-')) {
    return 'Expired';
  }
  return withExpiresMention ? `Expires in ${dateDiff}` : `In ${dateDiff}`;
};
