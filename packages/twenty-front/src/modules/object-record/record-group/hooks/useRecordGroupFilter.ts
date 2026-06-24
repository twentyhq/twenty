import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { getRecordGroupByFieldColumnName } from '@/object-record/record-group/utils/getRecordGroupByFieldColumnName';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordGroupFilter = (fields: FieldMetadataItem[]) => {
  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupFilter = useMemo(() => {
    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordIndexGroupFieldMetadataItem?.id,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          `Field metadata item with id ${recordIndexGroupFieldMetadataItem?.id} not found`,
        );
      }

      const recordGroupColumnName =
        getRecordGroupByFieldColumnName(fieldMetadataItem);

      if (!isDefined(currentRecordGroupDefinition.value)) {
        return { [recordGroupColumnName]: { is: 'NULL' } };
      }

      return {
        [recordGroupColumnName]: {
          eq: currentRecordGroupDefinition.value,
        },
      };
    }

    return {};
  }, [
    currentRecordGroupDefinition,
    fields,
    recordIndexGroupFieldMetadataItem?.id,
  ]);

  return { recordGroupFilter };
};
