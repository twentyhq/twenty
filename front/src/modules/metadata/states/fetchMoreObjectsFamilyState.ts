import { atomFamily } from 'recoil';

export const fetchMoreObjectsFamilyState = atomFamily<
  { fetchMore: () => void },
  string
>({
  key: 'fetchMoreObjectsFamilyState',
});
