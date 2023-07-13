import { atomFamily } from 'recoil';

export const companyCommentCountFamilyState = atomFamily<number | null, string>(
  {
    key: 'companyCommentCountFamilyState',
    default: null,
  },
);
