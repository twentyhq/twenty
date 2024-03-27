import { createComponentState } from 'twenty-ui';

export const relationPickerPreselectedIdScopedState = createComponentState<
  string | undefined
>({
  key: 'relationPickerPreselectedIdScopedState',
  defaultValue: undefined,
});
