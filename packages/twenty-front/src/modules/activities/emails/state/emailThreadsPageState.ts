import { atom } from 'recoil';

export type EmailThreadsPageType = {
  pageNumber: number;
  hasNextPage: boolean;
};

export const emailThreadsPageState = atom<EmailThreadsPageType>({
  key: 'EmailThreadsPageState',
  default: { pageNumber: 1, hasNextPage: true },
});
