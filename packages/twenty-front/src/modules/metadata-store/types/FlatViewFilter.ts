import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export type FlatViewFilter = ViewWithRelations['viewFilters'][number] & {
  viewId: string;
};
