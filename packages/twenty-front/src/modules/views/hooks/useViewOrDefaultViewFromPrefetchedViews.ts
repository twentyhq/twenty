import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useViewOrDefaultViewFromPrefetchedViews = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const indexViewId = useAtomFamilySelectorValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId },
  );

  const indexView = useAtomFamilySelectorValue(
    coreViewFromViewIdFamilySelector,
    {
      viewId: indexViewId ?? '',
    },
  );

  return { view: indexView };
};
