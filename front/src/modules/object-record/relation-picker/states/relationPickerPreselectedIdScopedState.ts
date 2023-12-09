import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const relationPickerPreselectedIdScopedState = createScopedState<
  string | undefined
>({
  key: 'relationPickerPreselectedIdScopedState',
  defaultValue: undefined,
});
