import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isLastRecordBoardColumnFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, string>({
    key: 'isLastRecordBoardColumnFamilyStateScopeMap',
    defaultValue: false,
  });
