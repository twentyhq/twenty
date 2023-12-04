import { atomFamily } from 'recoil';

export const isRecordBoardCardSelectedFamilyState = atomFamily<boolean, string>(
  {
    key: 'isRecordBoardCardSelectedFamilyState',
    default: false,
  },
);
