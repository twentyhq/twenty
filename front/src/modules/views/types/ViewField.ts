import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

export type ViewField = {
  id: string;
  fieldId: string;
  position: number;
  isVisible: boolean;
  size: number;
  definition: ColumnDefinition<FieldMetadata>;
};
