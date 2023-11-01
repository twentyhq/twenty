import { FilterDefinition } from './FilterDefinition';

export type FilterDefinitionByEntity<T> = FilterDefinition & {
  fieldId: keyof T;
};
