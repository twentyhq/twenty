import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const filterDropdownSearchInputScopedState = createScopedState<string>({
  key: 'filterDropdownSearchInputScopedState',
  defaultValue: '',
});
