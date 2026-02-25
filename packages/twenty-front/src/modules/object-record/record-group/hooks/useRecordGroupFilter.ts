import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordGroupFilter = (fields: FieldMetadataItem[]) => {
  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();
  const groupFieldMetadata = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = fields.find(
        (fieldMetadataItem) => fieldMetadataItem.id === groupFieldMetadata?.id,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          `Field metadata item with id ${groupFieldMetadata?.id} not found`,
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
  }, [currentRecordGroupDefinition, fields, groupFieldMetadata?.id]);

  return { recordGroupFilter };
};
