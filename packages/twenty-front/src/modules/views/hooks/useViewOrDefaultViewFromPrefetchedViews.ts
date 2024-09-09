import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { View } from '@/views/types/View';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
  viewId,
}: {
  objectMetadataItemId: string;
  viewId: string | null | undefined;
}) => {
  const { objectNameSingular } = useParams();
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectNameSingular ?? '',
  });
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(objectNamePlural);

  const view = useMemo(() => {
    return views.find(
      (view: View) =>
        (view.key === 'INDEX' || view?.id === viewId) &&
        view?.objectMetadataId === objectMetadataItemId,
    );
  }, [viewId, views, objectMetadataItemId]);

  return {
    view: {
      ...view,
      viewFilters:
        Number(view?.viewFilters?.length) > 0
          ? view?.viewFilters
          : (currentViewWithCombinedFiltersAndSorts?.viewFilters ?? []),
      viewSorts:
        Number(view?.viewSorts?.length) > 0
          ? view?.viewSorts
          : (currentViewWithCombinedFiltersAndSorts?.viewSorts ?? []),
    },
  };
};
