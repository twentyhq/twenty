import { createState } from "twenty-shared";

import { Billing } from '~/generated/graphql';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
