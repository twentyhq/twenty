import { createComponentFamilyState } from 'twenty-ui';

export const recordBoardRecordIdsByColumnIdComponentFamilyState =
  createComponentFamilyState<string[], string>({
    key: 'recordBoardRecordIdsByColumnIdComponentFamilyState',
    defaultValue: [],
  });
