import { PARTNER_COOKIE_KEY } from '@/auth/constants/PartnerCookieKey';
import { type PartnerCookie } from '@/auth/types/PartnerCookie';
import { isValidPartnerCookie } from '@/auth/utils/isValidPartnerCookie';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const partnerCookieState = createAtomState<PartnerCookie | null>({
  key: 'partnerCookie',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: PARTNER_COOKIE_KEY,
    attributes: {
      expires: 30,
    },
    validateInitFn: isValidPartnerCookie,
  },
});
