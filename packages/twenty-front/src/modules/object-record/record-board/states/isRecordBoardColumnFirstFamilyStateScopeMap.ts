import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isRecordBoardColumnFirstFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, string>({
    key: 'isRecordBoardColumnFirstFamilyStateScopeMap',
    defaultValue: false,
  });
