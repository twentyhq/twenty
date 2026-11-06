import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const affiliatePartnerNameState = createAtomState<{
  partner: string;
} | null>({
  key: 'affiliatePartnerName',
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
