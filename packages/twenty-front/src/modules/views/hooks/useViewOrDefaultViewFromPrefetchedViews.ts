import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilValue } from 'recoil';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const indexViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId,
    }),
  );

  const indexView = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: indexViewId ?? '',
    }),
  );

  return { view: indexView };
};
