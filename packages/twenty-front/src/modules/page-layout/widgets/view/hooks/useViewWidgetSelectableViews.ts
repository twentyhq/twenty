import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewVisibility } from '~/generated-metadata/graphql';

// Mirrors the server rule: personal views must not leak to everyone who can see the dashboard.
export const useViewWidgetSelectableViews = (
  objectMetadataItemId: string | null | undefined,
) => {
  const views = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItemId ?? '' },
  );

  return {
    selectableViews: views.filter(
      (view) => view.visibility === ViewVisibility.WORKSPACE,
    ),
  };
};
