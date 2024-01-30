import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export type EmailThreadsPageType = {
  pageNumber: number;
  hasNextPage: boolean;
};

export const emailThreadsPageStateScopeMap =
  createStateScopeMap<EmailThreadsPageType>({
    key: 'emailThreadsPageStateScopeMap',
    defaultValue: { pageNumber: 1, hasNextPage: true },
  });
