import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isDefined } from 'twenty-shared/utils';

export const useCurrentPageLayoutOrThrow = () => {
  const { currentPageLayout, pageLayoutPersisted } = useCurrentPageLayout();

  if (!isDefined(currentPageLayout)) {
    throw new Error('No current page layout found');
  }

  return { currentPageLayout, pageLayoutPersisted };
};
