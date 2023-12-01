import { atomFamily } from 'recoil';

export const isFetchingMoreRecordsFamilyState = atomFamily<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreRecordsFamilyState',
  default: false,
});
