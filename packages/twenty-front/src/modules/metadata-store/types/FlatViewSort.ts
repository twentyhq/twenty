import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export type FlatViewSort = CoreViewWithRelations['viewSorts'][number] & {
  viewId: string;
};
