import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Filter } from '../types/Filter';

export const selectedFilterScopedState = createComponentState<
  Filter | undefined | null
>({
  key: 'selectedFilterScopedState',
  defaultValue: undefined,
});
