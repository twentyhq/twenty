import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const objectFilterDropdownSelectedRecordIdsScopedState =
  createScopedState<string[]>({
    key: 'objectFilterDropdownSelectedRecordIdsScopedState',
    defaultValue: [],
  });
