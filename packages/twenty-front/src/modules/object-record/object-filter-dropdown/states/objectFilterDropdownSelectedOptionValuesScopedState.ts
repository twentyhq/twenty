import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectFilterDropdownSelectedOptionValuesScopedState =
  createStateScopeMap<string[]>({
    key: 'objectFilterDropdownSelectedOptionValuesScopedState',
    defaultValue: [],
  });
