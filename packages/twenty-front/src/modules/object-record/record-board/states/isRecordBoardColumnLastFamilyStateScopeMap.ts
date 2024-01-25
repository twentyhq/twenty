import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isRecordBoardColumnLastFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, string>({
    key: 'isRecordBoardColumnLastFamilyStateScopeMap',
    defaultValue: false,
  });
