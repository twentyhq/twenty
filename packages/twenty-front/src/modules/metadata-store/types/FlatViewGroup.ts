import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export type FlatViewGroup = CoreViewWithRelations['viewGroups'][number] & {
  viewId: string;
};
