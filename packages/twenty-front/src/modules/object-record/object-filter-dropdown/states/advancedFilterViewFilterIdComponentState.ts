import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const advancedFilterViewFilterIdComponentState = createComponentState<
  string | undefined
>({
  key: 'advancedFilterViewFilterIdComponentState',
  defaultValue: undefined,
});
