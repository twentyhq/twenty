import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { PARTNER_ATTRIBUTION_LIFETIME_DAYS } from 'twenty-shared/constants';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const partnerCookieState = createAtomState<{ partner: string } | null>({
  key: 'partnerCookie',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'partner',
    attributes: {
      expires: PARTNER_ATTRIBUTION_LIFETIME_DAYS,
    },
    validateInitFn: (payload) =>
      isDefined(payload.partner) &&
      normalizePartner(payload.partner) === payload.partner,
  },
});
