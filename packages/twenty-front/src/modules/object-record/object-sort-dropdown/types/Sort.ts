import { SortDefinition } from './SortDefinition';
import { SortDirection } from './SortDirection';

export type Sort = {
  fieldMetadataId: string;
  direction: SortDirection;
  definition: SortDefinition;
};
