import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSaveColumnsToView } from '@/object-record/record-table/hooks/useSaveColumnsToView';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

// TODO: see how we can better abstract this and set the correct interaction between view and table
//   but for now it allows to have a cleaner API globally.
export const useHandleColumnsChange = () => {
  const { saveColumnsToView } = useSaveColumnsToView();
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

    await saveColumnsToView(columns);
  };

  return {
    handleColumnsChange,
  };
};
