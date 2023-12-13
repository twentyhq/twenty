import { atom } from 'recoil';

import { Billing } from '~/generated/graphql';

export const billingState = atom<Billing>({
  key: 'billingState',
  default: { isBillingEnabled: false, billingUrl: '' },
});
