import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRatingMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldRating = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRatingMetadata> =>
  field.type === FieldMetadataType.RATING;
