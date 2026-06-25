import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export type FlatView = Omit<
  ViewWithRelations,
  | 'viewFields'
  | 'viewFieldGroups'
  | 'viewGroups'
  | 'viewFilters'
  | 'viewFilterGroups'
  | 'viewSorts'
>;
