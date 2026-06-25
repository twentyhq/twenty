import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';

export const useViewOrDefaultView = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId },
  );

  const indexView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: indexViewId ?? '',
  });

  return { view: indexView };
};
