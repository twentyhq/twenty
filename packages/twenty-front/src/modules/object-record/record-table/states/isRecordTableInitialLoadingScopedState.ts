import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordTableInitialLoadingScopedState =
  createStateScopeMap<boolean>({
    key: 'isRecordTableInitialLoadingScopedState',
    defaultValue: true,
  });
