import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Filter } from '../types/Filter';

export const selectedFilterComponentState = createComponentState<
  Filter | undefined | null
>({
  key: 'selectedFilterComponentState',
  defaultValue: undefined,
});
