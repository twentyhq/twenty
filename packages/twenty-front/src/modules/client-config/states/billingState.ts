import { createState } from 'twenty-ui';

import { Billing } from '~/generated/graphql';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
