import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { normalizePartner } from 'twenty-shared/utils';

export const partnerCookieState = createAtomState<
  | { partner: string; cookieAttributes?: Cookies.CookieAttributes }
  | { cookieAttributes?: Cookies.CookieAttributes }
  | null
>({
  key: 'partnerCookie',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'partner',
    attributes: {
      expires: 30,
    },
    validateInitFn: (payload) =>
      'partner' in payload &&
      normalizePartner(payload.partner) === payload.partner,
  },
});
