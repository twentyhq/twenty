import { atomFamily } from 'recoil';

export const peopleNameCellFamilyState = atomFamily<
  {
    firstName: string | null;
    lastName: string | null;
    commentCount: number | null;
  },
  string
>({
  key: 'peopleNameCellFamilyState',
  default: {
    firstName: null,
    lastName: null,
    commentCount: null,
  },
});
