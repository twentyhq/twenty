import { ColumnMappingValue } from './ColumnMappingValue';

export interface ColumnMapping {
  [columnName: string]: ColumnMappingValue;
}
