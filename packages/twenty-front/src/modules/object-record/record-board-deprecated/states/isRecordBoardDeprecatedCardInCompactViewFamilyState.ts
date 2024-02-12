import { atomFamily } from 'recoil';

export const isRecordBoardDeprecatedCardInCompactViewFamilyState = atomFamily<
  boolean,
  string
>({
  key: 'isRecordBoardDeprecatedCardInCompactViewFamilyState',
  default: true,
});
