import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export type FlatView = Omit<
  ViewWithRelations,
  | 'viewFields'
  | 'viewFieldGroups'
  | 'viewGroups'
  | 'viewTabs'
  | 'viewFilters'
  | 'viewFilterGroups'
  | 'viewSorts'
>;
