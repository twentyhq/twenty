import { Opportunity } from '@/pipeline/types/Opportunity';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const savedOpportunitiesScopedState = createStateScopeMap<Opportunity[]>(
  {
    key: 'savedOpportunitiesScopedState',
    defaultValue: [],
  },
);
