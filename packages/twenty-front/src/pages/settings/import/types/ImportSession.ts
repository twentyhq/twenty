import { CsvRow } from './CsvRow';
import { FieldCreationResult } from './FieldCreationResult';

export interface ImportSession {
  objectId: string;
  objectNameSingular: string;
  fields: FieldCreationResult[];
  csvRows: CsvRow[];
  isNewObject: boolean;
}
