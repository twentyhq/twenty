import { PARTNER_COOKIE_KEY } from '@/auth/constants/PartnerCookieKey';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const partnerCookieState = createAtomState<{ partner: string } | null>({
  key: 'partnerCookie',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: PARTNER_COOKIE_KEY,
    attributes: {
      expires: 30,
    },
    validateInitFn: (payload) =>
      isDefined(payload.partner) &&
      normalizePartner(payload.partner) === payload.partner,
  },
});
