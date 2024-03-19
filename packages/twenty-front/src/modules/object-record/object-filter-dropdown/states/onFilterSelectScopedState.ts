import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Filter } from '../types/Filter';

export const onFilterSelectScopedState = createComponentState<
  ((filter: Filter | null) => void) | undefined
>({
  key: 'onFilterSelectScopedState',
  defaultValue: undefined,
});
