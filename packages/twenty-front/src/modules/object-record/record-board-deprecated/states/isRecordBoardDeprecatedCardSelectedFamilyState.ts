import { atomFamily } from 'recoil';

export const isRecordBoardDeprecatedCardSelectedFamilyState = atomFamily<
  boolean,
  string
>({
  key: 'isRecordBoardDeprecatedCardSelectedFamilyState',
  default: false,
});
