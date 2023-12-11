import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/field/types/guards/isFieldText';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';

import { FieldContext } from '../../contexts/FieldContext';

export const useChipField = () => {
  const { entityId, fieldDefinition, basePathToShowPage } =
    useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) || isFieldFullName(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const record = useRecoilValue<any | null>(entityFieldsFamilyState(entityId));

  const { identifiersMapper } = useRelationPicker();

  return {
    basePathToShowPage,
    entityId,
    objectNameSingular,
    record,
    identifiersMapper,
  };
};
