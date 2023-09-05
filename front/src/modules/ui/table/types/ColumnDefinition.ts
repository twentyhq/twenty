import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

export type ColumnDefinition<T extends ViewFieldMetadata | unknown> =
  ViewFieldDefinition<T> & {
    size: number;
    index: number;
  };
