import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Sort } from '../../object-sort-dropdown/types/Sort';

export const tableSortsComponentState = createComponentState<Sort[]>({
  key: 'tableSortsComponentState',
  defaultValue: [],
});
