import { type Billing } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const billingState = createStateV2<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
