import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export type FlatViewGroup = ViewWithRelations['viewGroups'][number] & {
  viewId: string;
};
