import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldRatingValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRating } from '../../types/guards/isFieldRating';

export const useRatingField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Rating, isFieldRating, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldRatingValue | null>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const rating = +(fieldValue ?? 0);

  return {
    fieldDefinition,
    rating,
    setFieldValue,
    hotkeyScope,
  };
};
