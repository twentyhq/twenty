import { SortDefinition } from './SortDefinition';
import { SortDirection } from './SortDirection';

export type Sort = {
  key: string;
  direction: SortDirection;
  definition: SortDefinition;
};
