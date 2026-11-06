import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const partnerCookieState = createAtomState<{ partner: string } | null>({
  key: 'partnerCookie',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'partner',
    attributes: {
      expires: 30,
    },
    validateInitFn: (payload) =>
      isDefined(payload.partner) &&
      normalizePartner(payload.partner) === payload.partner,
  },
});
