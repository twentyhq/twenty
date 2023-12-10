import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { SortDirection } from '@/object-record/object-sort-dropdown/types/SortDirection';

export type ViewSort = {
  id: string;
  fieldMetadataId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
