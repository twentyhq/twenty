import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { useRecoilCallback } from 'recoil';

export const useSaveColumnsToView = () => {
  const { saveViewFields } = useSaveCurrentViewFields();

  const saveColumnsToView = useRecoilCallback(
    () => async (columns) => {
      await saveViewFields(
        mapColumnDefinitionsToViewFields(
          columns as ColumnDefinition<FieldMetadata>[],
        ),
      );
    },
    [saveViewFields],
  );

  return { saveColumnsToView };
};
