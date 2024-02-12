import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordBoardDeprecatedLoadedScopedState =
  createStateScopeMap<boolean>({
    key: 'isRecordBoardDeprecatedLoadedScopedState',
    defaultValue: false,
  });
