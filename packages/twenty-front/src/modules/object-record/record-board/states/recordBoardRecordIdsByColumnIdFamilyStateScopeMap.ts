import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const recordBoardRecordIdsByColumnIdFamilyStateScopeMap =
  createFamilyStateScopeMap<string[], string>({
    key: 'recordBoardRecordIdsByColumnIdFamilyStateScopeMap',
    defaultValue: [],
  });
