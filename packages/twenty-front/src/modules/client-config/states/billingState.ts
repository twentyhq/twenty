import { createState } from '@ui/utilities/state/utils/createState';

import { Billing } from '~/generated/graphql';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
