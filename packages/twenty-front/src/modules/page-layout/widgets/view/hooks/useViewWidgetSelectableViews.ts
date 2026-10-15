import { isViewWidgetSelectableView } from '@/page-layout/widgets/view/utils/isViewWidgetSelectableView';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';

export const useViewWidgetSelectableViews = (
  objectMetadataItemId: string | null | undefined,
) => {
  const views = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItemId ?? '' },
  );

  return {
    selectableViews: views.filter(isViewWidgetSelectableView),
  };
};
