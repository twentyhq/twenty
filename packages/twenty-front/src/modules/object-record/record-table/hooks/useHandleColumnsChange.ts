import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

// TODO: see how we can better abstract this and set the correct interaction between view and table
//   but for now it allows to have a cleaner API globally.
// TODO: should be solved with new RecordField abstraction
export const useHandleColumnsChange = () => {
  const { setTableColumns } = useSetTableColumns();

  const handleColumnsChange = async ({
    columns,
    recordTableId,
    objectMetadataId,
  }: {
    columns: ColumnDefinition<FieldMetadata>[];
    recordTableId: string;
    objectMetadataId: string;
  }) => {
    setTableColumns(columns, recordTableId, objectMetadataId);
  };

  return {
    handleColumnsChange,
  };
};
