import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useContext } from 'react';

export const usePersistFieldFromFieldInputContext = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.fields.some(
        (fieldMetadataItemToFind) =>
          fieldMetadataItemToFind.id === fieldDefinition.fieldMetadataId,
      ),
  );

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem?.id ?? '',
  });

  const persistFieldFromFieldInputContext = (valueToPersist: unknown) => {
    persistField({
      recordId,
      fieldDefinition,
      valueToPersist,
    });
  };

  return { persistFieldFromFieldInputContext };
};
