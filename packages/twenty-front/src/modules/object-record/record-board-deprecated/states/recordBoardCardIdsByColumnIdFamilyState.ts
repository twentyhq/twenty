import { atomFamily } from 'recoil';

export const recordBoardCardIdsByColumnIdFamilyState = atomFamily<
  string[],
  string
>({
  key: 'recordBoardCardIdsByColumnIdFamilyState',
  default: [],
});
