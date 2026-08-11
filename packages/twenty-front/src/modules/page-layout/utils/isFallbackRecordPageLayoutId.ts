import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';

export const isFallbackRecordPageLayoutId = (pageLayoutId: string): boolean =>
  pageLayoutId === DEFAULT_RECORD_PAGE_LAYOUT_ID;
