import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';

export const replaceObjectViewsInViewMetadataSlice = ({
  objectMetadataId,
  currentSlice,
  fetchedObjectSlice,
}: {
  objectMetadataId: string;
  currentSlice: ViewMetadataSlice;
  fetchedObjectSlice: ViewMetadataSlice;
}): ViewMetadataSlice => {
  const replacedViewIds = new Set([
    ...currentSlice.views
      .filter((view) => view.objectMetadataId === objectMetadataId)
      .map((view) => view.id),
    ...fetchedObjectSlice.views.map((view) => view.id),
  ]);

  const isKeptChild = ({ viewId }: { viewId: string }) =>
    !replacedViewIds.has(viewId);

  return {
    views: [
      ...currentSlice.views.filter((view) => !replacedViewIds.has(view.id)),
      ...fetchedObjectSlice.views,
    ],
    viewFields: [
      ...currentSlice.viewFields.filter(isKeptChild),
      ...fetchedObjectSlice.viewFields,
    ],
    viewFilters: [
      ...currentSlice.viewFilters.filter(isKeptChild),
      ...fetchedObjectSlice.viewFilters,
    ],
    viewSorts: [
      ...currentSlice.viewSorts.filter(isKeptChild),
      ...fetchedObjectSlice.viewSorts,
    ],
    viewGroups: [
      ...currentSlice.viewGroups.filter(isKeptChild),
      ...fetchedObjectSlice.viewGroups,
    ],
    viewFilterGroups: [
      ...currentSlice.viewFilterGroups.filter(isKeptChild),
      ...fetchedObjectSlice.viewFilterGroups,
    ],
    viewFieldGroups: [
      ...currentSlice.viewFieldGroups.filter(isKeptChild),
      ...fetchedObjectSlice.viewFieldGroups,
    ],
  };
};
