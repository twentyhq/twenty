import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { recordIndexGroupFieldMetadataIdComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexGroupFieldMetadataIdComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordGroupFilter = (fields: FieldMetadataItem[]) => {
  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();
  const groupFieldMetadataId = useRecoilComponentValue(
    recordIndexGroupFieldMetadataIdComponentSelector,
  );

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = fields.find(
        (fieldMetadataItem) => fieldMetadataItem.id === groupFieldMetadataId,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          `Field metadata item with id ${groupFieldMetadataId} not found`,
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
  }, [currentRecordGroupDefinition, fields, groupFieldMetadataId]);

  return { recordGroupFilter };
};
