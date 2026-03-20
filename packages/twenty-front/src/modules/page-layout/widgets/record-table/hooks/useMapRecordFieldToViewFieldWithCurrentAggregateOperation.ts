import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { type ViewField } from '@/views/types/ViewField';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useMapRecordFieldToViewFieldWithCurrentAggregateOperation = () => {
  const store = useStore();

  const mapRecordFieldToViewFieldWithCurrentAggregateOperation = useCallback(
    (recordField: RecordField): Omit<ViewField, 'definition'> => {
      const viewField = mapRecordFieldToViewField(recordField);

      const extendedAggregateOperation = store.get(
        viewFieldAggregateOperationState.atomFamily({
          viewFieldId: recordField.id,
        }),
      );

      return {
        ...viewField,
        aggregateOperation: isDefined(extendedAggregateOperation)
          ? convertExtendedAggregateOperationToAggregateOperation(
              extendedAggregateOperation,
            )
          : viewField.aggregateOperation,
      };
    },
    [store],
  );

  return { mapRecordFieldToViewFieldWithCurrentAggregateOperation };
};
