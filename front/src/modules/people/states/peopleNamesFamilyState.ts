import { atomFamily } from 'recoil';

export const peopleNameCellFamilyState = atomFamily<
  {
    firstName: string | null;
    lastName: string | null;
    commentCount: number | null;
    displayName: string | null;
    avatarUrl: string | null;
  },
  string
>({
  key: 'peopleNameCellFamilyState',
  default: {
    firstName: null,
    lastName: null,
    commentCount: null,
    displayName: null,
    avatarUrl: null,
  },
});
