import { FilterDefinition } from './FilterDefinition';

export type FilterDefinitionByEntity<T> = FilterDefinition & {
  field: keyof T;
};
