import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordTableInitialLoadingStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'isRecordTableInitialLoadingStateScopeMap',
    defaultValue: true,
  });
