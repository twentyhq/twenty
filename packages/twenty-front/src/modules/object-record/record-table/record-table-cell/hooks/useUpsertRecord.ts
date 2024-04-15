import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isDefined } from '~/utils/isDefined';

export const useUpsertRecord = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const { pendingRecordIdState } = useRecordTableStates();

  const pendingRecordId = useRecoilValue(pendingRecordIdState);
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
    if (isDefined(pendingRecordId) && isDefined(draftValue)) {
      createOneRecord({
        id: pendingRecordId,
        name: draftValue,
        position: 'first',
      });
    } else if (!pendingRecordId) {
      persistField();
    }
  };

  return { upsertRecord };
};
