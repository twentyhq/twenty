import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';

export type RecordTableWidgetViewSnapshot = {
  view: FlatView;
  viewFields: FlatViewField[];
};
