import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';

export const useSaveRecordFields = () => {
  const { saveViewFields } = useSaveCurrentViewFields();

  const saveRecordFields = (recordFields: RecordField[]) => {
    saveViewFields(recordFields.map(mapRecordFieldToViewField));
  };

  return {
    saveRecordFields,
  };
};
