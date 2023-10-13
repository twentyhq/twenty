import { FilterDefinition } from './FilterDefinition';

export type FilterDefinitionByEntity<T> = FilterDefinition & {
  key: keyof T;
};
