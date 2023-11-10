import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { SortDirection } from '@/ui/object/object-sort-dropdown/types/SortDirection';

export type ViewSort = {
  id?: string;
  fieldId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
