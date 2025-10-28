import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldRatingValue } from 'twenty-shared/types';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRating } from '../../types/guards/isFieldRating';

export const useRatingField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.RATING, isFieldRating, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldRatingValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const rating = fieldValue ?? null;

  return {
    fieldDefinition,
    rating,
    setFieldValue,
  };
};
