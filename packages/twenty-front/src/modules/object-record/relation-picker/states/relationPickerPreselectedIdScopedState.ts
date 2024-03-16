import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const relationPickerPreselectedIdScopedState = createComponentState<
  string | undefined
>({
  key: 'relationPickerPreselectedIdScopedState',
  defaultValue: undefined,
});
