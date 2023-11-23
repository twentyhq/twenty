import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { entityFieldsFamilyState } from '@/ui/object/field/states/entityFieldsFamilyState';
import { isFieldFullName } from '@/ui/object/field/types/guards/isFieldFullName';
import { isFieldText } from '@/ui/object/field/types/guards/isFieldText';

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
