import { type View } from '@/views/types/View';

// ViewWithRelations is the shape assembled from the metadata store.
// After simplification it's identical to View.
export type ViewWithRelations = View;

// Re-export essentials used by the metadata store layer
export type ViewFieldEssential = View['viewFields'][number];
export type ViewFieldGroupEssential = NonNullable<
  View['viewFieldGroups']
>[number];
