import { atomFamily } from 'recoil';

export const boardCardIdsByColumnIdFamilyState = atomFamily<string[], string>({
  key: 'boardCardIdsByColumnIdFamilyState',
  default: [],
});
