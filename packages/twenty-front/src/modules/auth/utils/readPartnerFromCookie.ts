import { PARTNER_COOKIE_KEY } from '@/auth/constants/PartnerCookieKey';
import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject, normalizePartner } from 'twenty-shared/utils';
import { cookieStorage } from '~/utils/cookie-storage';

// Read at submit time: the partner atom is loaded once per tab, so it misses a link opened in another tab afterwards
export const readPartnerFromCookie = (): string | undefined => {
  const savedValue = cookieStorage.getItem(PARTNER_COOKIE_KEY);

  if (!isNonEmptyString(savedValue)) {
    return undefined;
  }

  try {
    const parsedValue: unknown = JSON.parse(savedValue);

    return isPlainObject(parsedValue)
      ? normalizePartner(parsedValue.partner)
      : undefined;
  } catch {
    return undefined;
  }
};
