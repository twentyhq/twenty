import { SortDefinition } from '@/ui/object/sort/types/SortDefinition';
import { SortDirection } from '@/ui/object/sort/types/SortDirection';

export type ViewSort = {
  id?: string;
  fieldId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
