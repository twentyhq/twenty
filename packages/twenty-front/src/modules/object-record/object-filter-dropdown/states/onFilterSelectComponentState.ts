import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Filter } from '../types/Filter';

export const onFilterSelectComponentState = createComponentState<
  ((filter: Filter | null) => void) | undefined
>({
  key: 'onFilterSelectComponentState',
  defaultValue: undefined,
});
