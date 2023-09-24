import {
  type ViewFieldDefinition,
  type ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export type ColumnDefinition<T extends ViewFieldMetadata | unknown> =
  ViewFieldDefinition<T> & {
    size: number;
  };
