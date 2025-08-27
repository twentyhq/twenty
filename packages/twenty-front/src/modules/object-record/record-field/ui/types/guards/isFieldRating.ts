import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldRatingMetadata } from '../FieldMetadata';

export const isFieldRating = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRatingMetadata> =>
  field.type === FieldMetadataType.RATING;
