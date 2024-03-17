import { createComponentState } from 'twenty-ui';

import { Filter } from '../types/Filter';

export const onFilterSelectComponentState = createComponentState<
  ((filter: Filter | null) => void) | undefined
>({
  key: 'onFilterSelectComponentState',
  defaultValue: undefined,
});
