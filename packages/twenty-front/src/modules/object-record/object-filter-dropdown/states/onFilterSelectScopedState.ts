import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Filter } from '../types/Filter';

export const onFilterSelectScopedState = createStateScopeMap<
  ((filter: Filter) => void) | undefined
>({
  key: 'onFilterSelectScopedState',
  defaultValue: undefined,
});
