import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';
import { SortDirection } from '@/ui/data/sort/types/SortDirection';

export type ViewSort = {
  id?: string;
  fieldId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
