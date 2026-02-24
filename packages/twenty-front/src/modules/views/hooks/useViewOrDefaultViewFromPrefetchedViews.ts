import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const indexViewId = useFamilySelectorValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId },
  );

  const indexView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: indexViewId ?? '',
  });

  return { view: indexView };
};
