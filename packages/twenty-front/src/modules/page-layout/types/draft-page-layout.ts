import { type PageLayout } from './pageLayoutTypes';

export type DraftPageLayout = Omit<
  PageLayout,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;
