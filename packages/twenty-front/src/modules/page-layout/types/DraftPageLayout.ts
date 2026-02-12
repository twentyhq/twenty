import { type PageLayout } from '@/page-layout/types/PageLayout';

export type DraftPageLayout = Omit<
  PageLayout,
  'createdAt' | 'updatedAt' | 'deletedAt'
>;
