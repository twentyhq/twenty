import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { type View } from '@/views/types/View';

export const buildRecordTableWidgetViewSnapshotFromView = (
  view: View,
): RecordTableWidgetViewSnapshot => {
  const {
    viewFields,
    viewFilters,
    viewFilterGroups,
    viewSorts,
    viewGroups: _viewGroups,
    viewFieldGroups: _viewFieldGroups,
    ...viewProps
  } = view;

  const flatViewFields: FlatViewField[] = viewFields.map((field) => ({
    ...field,
    viewId: view.id,
  }));

  const flatViewFilters: FlatViewFilter[] = viewFilters.map((filter) => ({
    ...filter,
    viewId: view.id,
  }));

  const flatViewFilterGroups: FlatViewFilterGroup[] = (
    viewFilterGroups ?? []
  ).map((group) => ({
    ...group,
    viewId: view.id,
  }));

  const flatViewSorts: FlatViewSort[] = viewSorts.map((sort) => ({
    ...sort,
    viewId: view.id,
  }));

  return {
    view: viewProps,
    viewFields: flatViewFields,
    viewFilters: flatViewFilters,
    viewFilterGroups: flatViewFilterGroups,
    viewSorts: flatViewSorts,
  };
};
