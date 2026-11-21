import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useEnsureObjectViewsLoaded } from '@/views/hooks/useEnsureObjectViewsLoaded';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';

export const useViewOrDefaultView = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  useEnsureObjectViewsLoaded([objectMetadataItemId]);

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId },
  );

  const indexView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: indexViewId ?? '',
  });

  return { view: indexView };
};
