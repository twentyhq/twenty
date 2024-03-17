import { createComponentState } from 'twenty-ui';

import { Sort } from '../types/Sort';

export const onSortSelectComponentState = createComponentState<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectComponentState',
  defaultValue: undefined,
});
