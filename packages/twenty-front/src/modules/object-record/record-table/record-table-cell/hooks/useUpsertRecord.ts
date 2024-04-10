import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';
import { recordTablePendingRecordIdState } from '@/object-record/record-table/states/recordTablePendingRecordIdState';
import { isDefined } from '~/utils/isDefined';

export const useUpsertRecord = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const recordTablePendingRecordId = useRecoilValue(
    recordTablePendingRecordIdState,
  );
  const fieldName = fieldDefinition.metadata.fieldName;
  const { getDraftValueSelector } = useRecordFieldInputStates(
    `${entityId}-${fieldName}`,
  );
  const draftValue = useRecoilValue(getDraftValueSelector());

  const objectNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular ?? '';
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
  });

  const upsertRecord = (persistField: () => void) => {
    if (isDefined(recordTablePendingRecordId) && isDefined(draftValue)) {
      createOneRecord({
        id: recordTablePendingRecordId,
        name: draftValue,
        position: 'first',
      });
    } else if (!recordTablePendingRecordId) {
      persistField();
    }
  };

  return { upsertRecord };
};
