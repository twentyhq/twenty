import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isObjectFilterDropdownUnfoldedScopedState =
  createStateScopeMap<boolean>({
    key: 'isObjectFilterDropdownUnfoldedScopedState',
    defaultValue: false,
  });
