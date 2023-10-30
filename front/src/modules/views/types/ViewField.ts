import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

export type ViewField = {
  id: string;
  fieldId: string;
  position: number;
  isVisible: boolean;
  size: number;
  definition: ColumnDefinition<FieldMetadata>;
};
