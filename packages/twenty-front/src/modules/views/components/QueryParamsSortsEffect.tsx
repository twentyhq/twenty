import { useEffect } from 'react';

import { useSortsFromQueryParams } from '@/views/hooks/internal/useSortsFromQueryParams';
import { useApplyViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyViewSortsToCurrentRecordSorts';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamSsortsEffect = () => {
  const { haSsortsQueryParams, getSortsFromQueryParams, objectMetadataItem } =
    useSortsFromQueryParams();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewSortsToCurrentRecordSorts } =
    useApplyViewSortsToCurrentRecordSorts();

  const currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !haSsortsQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem
    ) {
      return;
    }

    const sortsFromParams = getSortsFromQueryParams();
    if (sortsFromParams.length > 0) {
      const viewSorts = sortsFromParams.map((sort) => ({
        ...sort,
        viewId: currentView?.id ?? '',
      }));

      applyViewSortsToCurrentRecordSorts(viewSorts);
    }
  }, [
    haSsortsQueryParams,
    getSortsFromQueryParams,
    applyViewSortsToCurrentRecordSorts,
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    currentView?.id,
  ]);

  return null;
};
