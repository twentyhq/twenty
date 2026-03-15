import { type CoreViewFieldEssential } from '@/views/types/CoreViewWithRelations';

export type FlatViewField = CoreViewFieldEssential & {
  viewId: string;
};
