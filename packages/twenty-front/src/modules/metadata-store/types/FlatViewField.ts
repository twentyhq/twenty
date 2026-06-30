import { type ViewFieldEssential } from '@/views/types/ViewWithRelations';

export type FlatViewField = ViewFieldEssential & {
  viewId: string;
};
