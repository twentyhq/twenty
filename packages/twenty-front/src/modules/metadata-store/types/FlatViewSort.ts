import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export type FlatViewSort = ViewWithRelations['viewSorts'][number] & {
  viewId: string;
};
