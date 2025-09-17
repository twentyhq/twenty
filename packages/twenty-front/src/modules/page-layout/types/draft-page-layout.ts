import { type PageLayoutWithData } from './pageLayoutTypes';

export type DraftPageLayout = Omit<
  PageLayoutWithData,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;
