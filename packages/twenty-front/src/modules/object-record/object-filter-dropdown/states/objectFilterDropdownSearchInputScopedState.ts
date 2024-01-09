import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectFilterDropdownSearchInputScopedState =
  createStateScopeMap<string>({
    key: 'objectFilterDropdownSearchInputScopedState',
    defaultValue: '',
  });
