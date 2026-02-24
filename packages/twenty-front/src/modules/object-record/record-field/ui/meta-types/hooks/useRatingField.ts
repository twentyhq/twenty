import { useContext } from 'react';

import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldRatingValue } from 'twenty-shared/types';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { useFamilySelectorStateV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorStateV2';

export const useRatingField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.RATING, isFieldRating, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useFamilySelectorStateV2(
    recordStoreFamilySelectorV2,
    { recordId, fieldName },
  );

  const rating = (fieldValue ?? null) as FieldRatingValue | null;

  return {
    fieldDefinition,
    rating,
    setFieldValue,
  };
};
