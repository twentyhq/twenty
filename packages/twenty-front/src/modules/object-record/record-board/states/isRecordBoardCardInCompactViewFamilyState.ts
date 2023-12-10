import { atomFamily } from 'recoil';

export const isRecordBoardCardInCompactViewFamilyState = atomFamily<
  boolean,
  string
>({
  key: 'isRecordBoardCardInCompactViewFamilyState',
  default: true,
});
