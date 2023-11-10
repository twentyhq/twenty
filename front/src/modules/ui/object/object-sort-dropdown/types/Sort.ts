import { SortDefinition } from './SortDefinition';
import { SortDirection } from './SortDirection';

export type Sort = {
  fieldId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
