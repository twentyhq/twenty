import { type Billing } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const billingState = createAtomState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
