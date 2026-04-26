import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';

export type RecordTableWidgetViewSnapshot = {
  view: FlatView;
  viewFields: FlatViewField[];
  viewFilters: FlatViewFilter[];
  viewFilterGroups: FlatViewFilterGroup[];
  viewSorts: FlatViewSort[];
};
