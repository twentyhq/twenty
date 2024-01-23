import { atomFamily } from 'recoil';

export const viewableMessageThreadIdsFamilyState = atomFamily<
  string | null,
  string
>({
  key: 'viewableMessageThreadIdsState',
  default: null,
});
