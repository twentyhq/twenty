import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isObjectFilterDropdownOperandSelectUnfoldedScopedState =
  createStateScopeMap<boolean>({
    key: 'isObjectFilterDropdownOperandSelectUnfoldedScopedState',
    defaultValue: false,
  });
