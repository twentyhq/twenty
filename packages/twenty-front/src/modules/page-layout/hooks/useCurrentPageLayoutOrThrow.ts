import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useCurrentPageLayoutOrThrow = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(currentPageLayout)) {
    throw new Error(doNotTranslate('No current page layout found'));
  }

  return { currentPageLayout };
};
