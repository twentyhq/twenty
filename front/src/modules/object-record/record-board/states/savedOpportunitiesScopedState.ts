import { Opportunity } from '@/pipeline/types/Opportunity';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const savedOpportunitiesScopedState = createScopedState<Opportunity[]>({
  key: 'savedOpportunitiesScopedState',
  defaultValue: [],
});
