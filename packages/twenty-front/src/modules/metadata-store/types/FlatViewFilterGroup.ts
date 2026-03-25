import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type ViewFilterGroupRelation = NonNullable<
  ViewWithRelations['viewFilterGroups']
>[number];

export type FlatViewFilterGroup = ViewFilterGroupRelation;
