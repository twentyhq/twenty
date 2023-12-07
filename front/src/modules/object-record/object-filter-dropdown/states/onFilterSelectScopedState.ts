import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Filter } from '../types/Filter';

export const onFilterSelectScopedState = createScopedState<
  ((filter: Filter) => void) | undefined
>({
  key: 'onFilterSelectScopedState',
  defaultValue: undefined,
});
