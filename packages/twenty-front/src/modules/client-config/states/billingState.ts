import { atom } from 'recoil';

import { Billing } from '~/generated/graphql';

export const billingState = atom<Billing | null>({
  key: 'billingState',
  default: null,
});
