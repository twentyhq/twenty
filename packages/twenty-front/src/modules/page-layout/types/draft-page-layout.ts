import { type PageLayoutWithData } from './pageLayoutTypes';

export type DraftPageLayout = Omit<
  PageLayoutWithData,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
