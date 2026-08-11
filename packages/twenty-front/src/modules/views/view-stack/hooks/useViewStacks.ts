import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { computeViewStacks } from '@/views/view-stack/utils/computeViewStacks';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useViewStacks = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const { currentView } = useGetCurrentViewOnly();

  const viewStacks = useMemo(
    () => computeViewStacks(viewsOnCurrentObject),
    [viewsOnCurrentObject],
  );

  const activeViewStack = isDefined(currentView)
    ? viewStacks.find(
        (viewStack) =>
          viewStack.rootView.id === currentView.id ||
          viewStack.childViews.some(
            (childView) => childView.id === currentView.id,
          ),
      )
    : undefined;

  return { viewStacks, activeViewStack, currentView };
};
