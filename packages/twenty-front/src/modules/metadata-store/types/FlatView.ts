import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export type FlatView = Omit<
  CoreViewWithRelations,
  | 'viewFields'
  | 'viewFieldGroups'
  | 'viewGroups'
  | 'viewFilters'
  | 'viewFilterGroups'
  | 'viewSorts'
>;
