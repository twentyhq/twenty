import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type OpenTableCellArgs = {
  initialValue?: string;
  cellPosition: TableCellPosition;
  isReadOnly: boolean;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
  isNavigating: boolean;
};
