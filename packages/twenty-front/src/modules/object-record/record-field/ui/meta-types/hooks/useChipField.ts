import { useContext } from 'react';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/record-field/ui/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useChipField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const record = useFamilyAtomValue(recordStoreFamilyState, recordId);

  return {
    objectNameSingular,
    record,
  };
};
