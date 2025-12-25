import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useChipField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  return {
    objectNameSingular,
    record,
  };
};
