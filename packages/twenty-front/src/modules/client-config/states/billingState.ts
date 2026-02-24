import { type Billing } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
