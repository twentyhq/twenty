import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const filterDropdownSelectedEntityIdScopedState = createScopedState<
  string | null
>({
  key: 'filterDropdownSelectedEntityIdScopedState',
  defaultValue: null,
});
