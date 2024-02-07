import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldEmpty = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const fieldValue = useRecoilValue(
    recordStoreFamilySelector({
      fieldName: fieldDefinition.metadata.fieldName,
      recordId: entityId,
    }),
  );

  return isFieldValueEmpty({
    fieldDefinition,
    fieldValue,
  });
};
