import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export type EmailThreadsPageType = {
  pageNumber: number;
  hasNextPage: boolean;
};

export const emailThreadsPageComponentState =
  createComponentState<EmailThreadsPageType>({
    key: 'emailThreadsPageComponentState',
    defaultValue: { pageNumber: 1, hasNextPage: true },
  });
