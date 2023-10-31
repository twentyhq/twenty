import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const objectFilterDropdownSearchInputScopedState =
  createScopedState<string>({
    key: 'objectFilterDropdownSearchInputScopedState',
    defaultValue: '',
  });
