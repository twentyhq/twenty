import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectFilterDropdownSelectedRecordIdsScopedState =
  createStateScopeMap<string[]>({
    key: 'objectFilterDropdownSelectedRecordIdsScopedState',
    defaultValue: [],
  });
