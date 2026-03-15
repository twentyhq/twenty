import { type PageLayout } from '@/page-layout/types/PageLayout';

export type FlatPageLayout = Omit<PageLayout, 'tabs'>;
