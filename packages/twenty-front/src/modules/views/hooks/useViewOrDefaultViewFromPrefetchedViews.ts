import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const indexViewId = useFamilySelectorValueV2(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId },
  );

  const indexView = useFamilySelectorValueV2(coreViewFromViewIdFamilySelector, {
    viewId: indexViewId ?? '',
  });

  return { view: indexView };
};
