import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const relationPickerPreselectedIdScopedState = createStateScopeMap<
  string | undefined
>({
  key: 'relationPickerPreselectedIdScopedState',
  defaultValue: undefined,
});
