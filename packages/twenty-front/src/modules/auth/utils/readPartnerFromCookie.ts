import { PARTNER_COOKIE_KEY } from '@/auth/constants/PartnerCookieKey';
import { type PartnerCookie } from '@/auth/types/PartnerCookie';
import { isValidPartnerCookie } from '@/auth/utils/isValidPartnerCookie';
import { createJotaiCookieStorage } from '@/ui/utilities/state/jotai/utils/createJotaiCookieStorage';

const partnerCookieStorage = createJotaiCookieStorage<PartnerCookie | null>({
  cookieKey: PARTNER_COOKIE_KEY,
  validateInitFn: isValidPartnerCookie,
});

export const readPartnerFromCookie = (): string | undefined =>
  partnerCookieStorage.getItem(PARTNER_COOKIE_KEY, null)?.partner;
