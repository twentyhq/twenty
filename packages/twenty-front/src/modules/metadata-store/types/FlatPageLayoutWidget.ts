import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export type FlatPageLayoutWidget = PageLayoutWidget & {
  pageLayoutTabId: string;
};
