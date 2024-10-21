import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const advancedFilterViewFilterGroupIdComponentState =
  createComponentState<string | undefined>({
    key: 'advancedFilterViewFilterGroupIdComponentState',
    defaultValue: undefined,
  });
