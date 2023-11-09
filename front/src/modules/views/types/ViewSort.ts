import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { SortDirection } from '@/ui/object/object-sort-dropdown/types/SortDirection';

export type ViewSort = {
  id?: string;
  fieldMetadataId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
