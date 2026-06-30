import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { differenceInYears, parseISO } from 'date-fns';

import { NEVER_EXPIRE_DELTA_IN_YEARS } from '@/settings/developers/constants/NeverExpireDeltaInYears';
import { beautifyDateDiff } from '~/utils/date-utils';

export const doesNeverExpire = (expiresAt: string) => {
  const expirationDate = parseISO(expiresAt);
  const now = new Date();
  const yearsDiff = differenceInYears(expirationDate, now);
  return yearsDiff > NEVER_EXPIRE_DELTA_IN_YEARS / 10;
};

export const isExpired = (expiresAt: string | null) => {
  if (!isNonEmptyString(expiresAt) || doesNeverExpire(expiresAt)) {
    return false;
  }
  const dateDiff = beautifyDateDiff(expiresAt, undefined, true);
  return dateDiff.includes('-');
};

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention = false,
  short = true,
) => {
  if (!isNonEmptyString(expiresAt) || doesNeverExpire(expiresAt)) {
    return withExpiresMention ? t`Never expires` : t`Never`;
  }
  const dateDiff = beautifyDateDiff(expiresAt, undefined, short);
  if (dateDiff.includes('-')) {
    return t`Expired`;
  }
  return withExpiresMention ? t`Expires in ${dateDiff}` : t`In ${dateDiff}`;
};
