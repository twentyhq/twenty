import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// The server requires the end field to differ from the start field and share
// its DATE or DATE_TIME type.
export const getCompatibleEndDateFields = ({
  dateFields,
  startFieldMetadataId,
}: {
  dateFields: FieldMetadataItem[];
  startFieldMetadataId: string | null | undefined;
}): FieldMetadataItem[] => {
  const startField = dateFields.find(
    (field) => field.id === startFieldMetadataId,
  );

  return dateFields.filter(
    (field) => field.id !== startField?.id && field.type === startField?.type,
  );
};
