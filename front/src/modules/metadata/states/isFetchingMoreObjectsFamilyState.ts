import { atomFamily } from 'recoil';

export const isFetchingMoreObjectsFamilyState = atomFamily<
  boolean,
  string | undefined
>({
  key: 'isFetchingMoreObjectsFamilyState',
  default: false,
});
