import { createComponentState } from 'twenty-ui';

import { Filter } from '../types/Filter';

export const selectedFilterComponentState = createComponentState<
  Filter | undefined | null
>({
  key: 'selectedFilterComponentState',
  defaultValue: undefined,
});
