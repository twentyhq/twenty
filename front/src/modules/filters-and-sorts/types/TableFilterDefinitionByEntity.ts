import { TableFilterDefinition } from './TableFilterDefinition';

export type TableFilterDefinitionByEntity<T> = TableFilterDefinition & {
  field: keyof T;
};
