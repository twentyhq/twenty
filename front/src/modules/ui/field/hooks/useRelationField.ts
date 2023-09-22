import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { genericEntityFieldFamilySelector } from '@/ui/editable-field/states/selectors/genericEntityFieldFamilySelector';

import { FieldContext } from '../contexts/FieldContext';
import { assertFieldMetadata } from '../types/guards/assertFieldMetadata';
import { isFieldRelation } from '../types/guards/isFieldRelation';

export const useRelationField = <RelationType extends object>() => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata('relation', isFieldRelation, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecoilValue<RelationType | null>(
    genericEntityFieldFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  return {
    fieldValue,
  };
};
