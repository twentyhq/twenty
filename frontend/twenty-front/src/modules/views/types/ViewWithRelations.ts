import { type View } from '@/views/types/View';

export type ViewWithRelations = View;

export type ViewFieldEssential = View['viewFields'][number];
export type ViewFieldGroupEssential = NonNullable<
  View['viewFieldGroups']
>[number];
