import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const activeRecordBoardDeprecatedCardIdsScopedState =
  createStateScopeMap<string[]>({
    key: 'activeRecordBoardDeprecatedCardIdsScopedState',
    defaultValue: [],
  });
