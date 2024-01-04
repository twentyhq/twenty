import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isRecordTableInitialLoadingScopedState =
  createScopedState<boolean>({
    key: 'isRecordTableInitialLoadingScopedState',
    defaultValue: true,
  });
