import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';

export type TableMetadata<ItemType> = {
  tableId: string;
  fields: TableFieldMetadata<ItemType>[];
  initialSort?: TableSortValue;
};
