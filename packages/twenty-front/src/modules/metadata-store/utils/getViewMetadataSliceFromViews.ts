import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export const getViewMetadataSliceFromViews = (
  views: ViewWithRelations[],
): ViewMetadataSlice => {
  const {
    flatViews,
    flatViewFields,
    flatViewFilters,
    flatViewSorts,
    flatViewGroups,
    flatViewFilterGroups,
    flatViewFieldGroups,
  } = splitViewWithRelated(views);

  return {
    views: flatViews,
    viewFields: flatViewFields,
    viewFilters: flatViewFilters,
    viewSorts: flatViewSorts,
    viewGroups: flatViewGroups,
    viewFilterGroups: flatViewFilterGroups,
    viewFieldGroups: flatViewFieldGroups,
  };
};
