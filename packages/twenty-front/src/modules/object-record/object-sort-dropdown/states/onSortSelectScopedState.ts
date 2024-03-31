import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Sort } from '../types/Sort';

export const onSortSelectComponentState = createComponentState<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectComponentState',
  defaultValue: undefined,
});
