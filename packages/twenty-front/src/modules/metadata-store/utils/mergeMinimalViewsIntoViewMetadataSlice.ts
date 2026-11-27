import { type FlatView } from '@/metadata-store/types/FlatView';
import { type MinimalView } from '@/metadata-store/types/MinimalMetadata';
import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { isDefined } from 'twenty-shared/utils';

export const mergeMinimalViewsIntoViewMetadataSlice = ({
  minimalViews,
  currentSlice,
  loadedViewHashByObjectMetadataId,
}: {
  minimalViews: MinimalView[];
  currentSlice: ViewMetadataSlice;
  loadedViewHashByObjectMetadataId: Record<string, string> | undefined;
}): ViewMetadataSlice => {
  const isObjectLoaded = (objectMetadataId: string) =>
    isDefined(loadedViewHashByObjectMetadataId?.[objectMetadataId]);

  const currentViewsById = new Map(
    currentSlice.views.map((view) => [view.id, view]),
  );

  const views = minimalViews.map((minimalView) => {
    const { __typename: _typename, ...minimalViewProperties } = minimalView;

    const loadedView = isObjectLoaded(minimalView.objectMetadataId)
      ? currentViewsById.get(minimalView.id)
      : undefined;

    return { ...loadedView, ...minimalViewProperties } as FlatView;
  });

  const loadedViewIds = new Set(
    views
      .filter((view) => isObjectLoaded(view.objectMetadataId))
      .map((view) => view.id),
  );

  const isKeptChild = ({ viewId }: { viewId: string }) =>
    loadedViewIds.has(viewId);

  return {
    views,
    viewFields: currentSlice.viewFields.filter(isKeptChild),
    viewFilters: currentSlice.viewFilters.filter(isKeptChild),
    viewSorts: currentSlice.viewSorts.filter(isKeptChild),
    viewGroups: currentSlice.viewGroups.filter(isKeptChild),
    viewFilterGroups: currentSlice.viewFilterGroups.filter(isKeptChild),
    viewFieldGroups: currentSlice.viewFieldGroups.filter(isKeptChild),
  };
};
