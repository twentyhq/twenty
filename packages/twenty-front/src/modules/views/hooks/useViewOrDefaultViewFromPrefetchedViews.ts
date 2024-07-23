import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { useMemo } from 'react';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
  viewId,
}: {
  objectMetadataItemId: string;
  viewId: string | null | undefined;
}) => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const view = useMemo(() => {
    return views.find(
      (view: View) =>
        (view.key === 'INDEX' || view?.id === viewId) &&
        view?.objectMetadataId === objectMetadataItemId,
    );
  }, [viewId, views, objectMetadataItemId]);

  return { view };
};
