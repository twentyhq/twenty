import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

type SplitResult = {
  flatViews: FlatView[];
  flatViewFields: FlatViewField[];
  flatViewFilters: FlatViewFilter[];
  flatViewSorts: FlatViewSort[];
  flatViewGroups: FlatViewGroup[];
  flatViewFilterGroups: FlatViewFilterGroup[];
  flatViewFieldGroups: FlatViewFieldGroup[];
};

export const splitViewWithRelated = (
  viewsWithRelated: CoreViewWithRelations[],
): SplitResult => {
  const flatViews: FlatView[] = [];
  const flatViewFields: FlatViewField[] = [];
  const flatViewFilters: FlatViewFilter[] = [];
  const flatViewSorts: FlatViewSort[] = [];
  const flatViewGroups: FlatViewGroup[] = [];
  const flatViewFilterGroups: FlatViewFilterGroup[] = [];
  const flatViewFieldGroups: FlatViewFieldGroup[] = [];

  for (const viewWithRelated of viewsWithRelated) {
    const {
      viewFields = [],
      viewFilters = [],
      viewSorts = [],
      viewGroups = [],
      viewFilterGroups = [],
      viewFieldGroups = [],
      ...viewProperties
    } = viewWithRelated;

    flatViews.push(viewProperties);

    for (const viewField of viewFields) {
      flatViewFields.push({
        ...viewField,
        viewId: viewWithRelated.id,
      });
    }

    for (const viewFilter of viewFilters) {
      flatViewFilters.push({
        ...viewFilter,
        viewId: viewWithRelated.id,
      });
    }

    for (const viewSort of viewSorts) {
      flatViewSorts.push({
        ...viewSort,
        viewId: viewWithRelated.id,
      });
    }

    for (const viewGroup of viewGroups) {
      flatViewGroups.push({
        ...viewGroup,
        viewId: viewWithRelated.id,
      });
    }

    for (const viewFilterGroup of viewFilterGroups) {
      flatViewFilterGroups.push(viewFilterGroup);
    }

    for (const viewFieldGroup of viewFieldGroups) {
      const { viewFields: _viewFields, ...viewFieldGroupProperties } =
        viewFieldGroup;

      flatViewFieldGroups.push(viewFieldGroupProperties);
    }
  }

  return {
    flatViews,
    flatViewFields,
    flatViewFilters,
    flatViewSorts,
    flatViewGroups,
    flatViewFilterGroups,
    flatViewFieldGroups,
  };
};
