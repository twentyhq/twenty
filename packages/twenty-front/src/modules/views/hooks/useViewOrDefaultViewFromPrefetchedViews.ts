import { prefetchIndexViewIdFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchIndexViewIdFromObjectMetadataItemFamilySelector';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilValue } from 'recoil';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
  viewId,
}: {
  objectMetadataItemId: string;
  viewId: string | null | undefined;
}) => {
  const indexViewId = useRecoilValue(
    prefetchIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId,
    }),
  );

  const indexView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: indexViewId ?? '',
    }),
  );

  return { view: indexView };
};
