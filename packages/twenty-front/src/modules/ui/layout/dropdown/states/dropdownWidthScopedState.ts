import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const dropdownWidthScopedState = createScopedState<number | undefined>({
  key: 'dropdownWidthScopedState',
  defaultValue: 160,
});
