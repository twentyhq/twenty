import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
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
