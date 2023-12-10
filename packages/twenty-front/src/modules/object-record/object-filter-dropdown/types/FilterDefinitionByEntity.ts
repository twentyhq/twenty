import { FilterDefinition } from './FilterDefinition';

export type FilterDefinitionByEntity<T> = FilterDefinition & {
  fieldMetadataId: keyof T;
};
