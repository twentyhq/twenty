import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useSortsFromQueryParams } from '@/views/hooks/internal/useSortsFromQueryParams';
import { useApplyViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyViewSortsToCurrentRecordSorts';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamsSortsEffect = () => {
  const { hasSortsQueryParams, getSortsFromQueryParams, objectMetadataItem } =
    useSortsFromQueryParams();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewSortsToCurrentRecordSorts } =
    useApplyViewSortsToCurrentRecordSorts();

  const [, setSearchParams] = useSearchParams();

  const currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !hasSortsQueryParams ||
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

      setSearchParams(
        (currentParams) => {
          const newParams = new URLSearchParams(currentParams);
          newParams.delete('sort');
          return newParams;
        },
        { replace: true },
      );
    }
  }, [
    hasSortsQueryParams,
    getSortsFromQueryParams,
    applyViewSortsToCurrentRecordSorts,
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    currentView?.id,
    setSearchParams,
  ]);

  return <></>;
};
