import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRatingMetadata } from '../FieldMetadata';

export const isFieldRating = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRatingMetadata> =>
  field.type === FieldMetadataType.Rating;
