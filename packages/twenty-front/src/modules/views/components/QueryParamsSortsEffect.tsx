import { useEffect } from 'react';

import { useSortsFromQueryParams } from '@/views/hooks/internal/useSortsFromQueryParams';
import { useApplyViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyViewSortsToCurrentRecordSorts';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamsSortsEffect = () => {
  const { hasSortsQueryParams, getSortsFromQueryParams, objectMetadataItem } =
    useSortsFromQueryParams();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewSortsToCurrentRecordSorts } =
    useApplyViewSortsToCurrentRecordSorts();

  const currentViewObjectMetadataItemIsDifferentFromUrlObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !hasSortsQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromUrlObjectMetadataItem
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
    hasSortsQueryParams,
    getSortsFromQueryParams,
    applyViewSortsToCurrentRecordSorts,
    currentViewObjectMetadataItemIsDifferentFromUrlObjectMetadataItem,
    currentView?.id,
  ]);

  return null;
};
