import { type Billing } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
