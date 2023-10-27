import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isFilterDropdownUnfoldedScopedState = createScopedState<boolean>({
  key: 'isFilterDropdownUnfoldedScopedState',
  defaultValue: false,
});
