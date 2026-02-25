import { useContext } from 'react';
import { isFieldFullName } from '@/object-recordStore/recordStore-field/ui/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-recordStore/recordStore-field/ui/types/guards/isFieldNumber';
import { isFieldText } from '@/object-recordStore/recordStore-field/ui/types/guards/isFieldText';
import { recordStoreFamilyState } from '@/object-recordStore/recordStore-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

import { FieldContext } from '@/object-recordStore/recordStore-field/ui/contexts/FieldContext';

export const useChipField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return {
    objectNameSingular,
    recordStore,
  };
};
