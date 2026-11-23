import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  differenceInHours,
  differenceInYears,
  isPast,
  parseISO,
} from 'date-fns';

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
  return isPast(parseISO(expiresAt));
};

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention = false,
  short = true,
) => {
  if (!isNonEmptyString(expiresAt) || doesNeverExpire(expiresAt)) {
    return withExpiresMention ? t`Never expires` : t`Never`;
  }
  if (isExpired(expiresAt)) {
    return t`Expired`;
  }
  if (differenceInHours(parseISO(expiresAt), new Date()) < 24) {
    return withExpiresMention
      ? t`Expires in less than a day`
      : t`In less than a day`;
  }
  const dateDiff = beautifyDateDiff(expiresAt, undefined, short);
  return withExpiresMention ? t`Expires in ${dateDiff}` : t`In ${dateDiff}`;
};
