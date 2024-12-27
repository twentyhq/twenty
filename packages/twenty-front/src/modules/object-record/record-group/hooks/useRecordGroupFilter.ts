import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useMemo } from 'react';
import { isDefined } from 'twenty-ui';

export const useRecordGroupFilter = (fields: FieldMetadataItem[]) => {
  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === currentRecordGroupDefinition.fieldMetadataId,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          `Field metadata item with id ${currentRecordGroupDefinition.fieldMetadataId} not found`,
        );
      }

      if (!isDefined(currentRecordGroupDefinition.value)) {
        return { [fieldMetadataItem.name]: { is: 'NULL' } };
      }

      return {
        [fieldMetadataItem.name]: {
          eq: currentRecordGroupDefinition.value,
        },
      };
    }

    return {};
  }, [currentRecordGroupDefinition, fields]);

  return { recordGroupFilter };
};
