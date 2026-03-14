import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

export type FlatPageLayoutTab = Omit<PageLayoutTab, 'widgets'> & {
  pageLayoutId: string;
};
