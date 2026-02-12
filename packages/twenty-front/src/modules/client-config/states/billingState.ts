import { type Billing } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
