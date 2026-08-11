import { DEFAULT_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultRecordPageLayout';
import { recordPageLayoutFromIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutFromIdFamilySelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { isFallbackRecordPageLayoutId } from '@/page-layout/utils/isFallbackRecordPageLayoutId';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';

export const useBasePageLayout = (
  pageLayoutId: string,
): PageLayout | undefined => {
  const isFallbackLayout = isFallbackRecordPageLayoutId(pageLayoutId);

  const cachedRecordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutFromIdFamilySelector,
    { pageLayoutId },
  );

  const shouldSkipQuery = isFallbackLayout || isDefined(cachedRecordPageLayout);

  const { data } = useQuery(FindOnePageLayoutDocument, {
    variables: {
      id: pageLayoutId,
    },
    skip: shouldSkipQuery,
  });

  if (isFallbackLayout) {
    return DEFAULT_RECORD_PAGE_LAYOUT;
  }

  if (isDefined(cachedRecordPageLayout)) {
    return cachedRecordPageLayout;
  }

  if (isDefined(data?.getPageLayout)) {
    return transformPageLayout(data.getPageLayout);
  }

  return undefined;
};
