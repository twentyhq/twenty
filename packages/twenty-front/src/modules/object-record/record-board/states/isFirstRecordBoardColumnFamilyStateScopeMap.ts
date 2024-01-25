import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isFirstRecordBoardColumnFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, string>({
    key: 'isFirstRecordBoardColumnFamilyStateScopeMap',
    defaultValue: false,
  });
