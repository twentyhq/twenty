import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';

// A metadata store cached before this field existed reads it back as undefined,
// and those clients must keep their pinned tab until the store refreshes.
export const getIsFirstTabPinned = (
  pageLayout: Partial<Pick<DraftPageLayout, 'isFirstTabPinned'>>,
): boolean => pageLayout.isFirstTabPinned ?? true;
