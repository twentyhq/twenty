import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export type FlatViewFilter = CoreViewWithRelations['viewFilters'][number] & {
  viewId: string;
};
