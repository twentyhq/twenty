import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { RatingValue } from '@/object-record/record-field/meta-types/constants/RatingValues';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRating } from '../../types/guards/isFieldRating';

export const useRatingField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Rating, isFieldRating, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<RatingValue | null>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const rating = fieldValue ?? RatingValue.RATING_1;

  return {
    fieldDefinition,
    rating,
    setFieldValue,
    hotkeyScope,
  };
};
