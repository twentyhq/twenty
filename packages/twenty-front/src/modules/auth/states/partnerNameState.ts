import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const partnerNameState = createAtomState<{ partner: string } | null>({
  key: 'partnerName',
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
