import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const useCurrentPageLayoutOrThrow = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(currentPageLayout)) {
    throw new Error(doNotTranslate('No current page layout found'));
  }

  return { currentPageLayout };
};
