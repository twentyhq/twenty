import { TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';

export type TableMetadata<ItemType> = {
  tableId: string;
  fields: TableFieldMetadata<ItemType>[];
};
