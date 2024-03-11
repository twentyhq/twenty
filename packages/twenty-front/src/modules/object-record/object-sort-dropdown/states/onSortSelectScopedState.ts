import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Sort } from '../types/Sort';

export const onSortSelectScopedState = createComponentState<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectScopedState',
  defaultValue: undefined,
});
