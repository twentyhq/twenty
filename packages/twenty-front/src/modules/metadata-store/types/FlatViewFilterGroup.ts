import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

type ViewFilterGroupRelation = NonNullable<
  CoreViewWithRelations['viewFilterGroups']
>[number];

export type FlatViewFilterGroup = ViewFilterGroupRelation;
