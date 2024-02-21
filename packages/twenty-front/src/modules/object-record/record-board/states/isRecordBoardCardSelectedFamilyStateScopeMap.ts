import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isRecordBoardCardSelectedFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, string>({
    key: 'isRecordBoardCardSelectedFamilyStateScopeMap',
    defaultValue: false,
  });
