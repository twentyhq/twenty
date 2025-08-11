import {
  type FieldMetadata,
  type FieldTsVectorMetadata,
} from '../FieldMetadata';

import { type FieldDefinition } from '../FieldDefinition';

import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTsVector = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTsVectorMetadata> =>
  field.type === FieldMetadataType.TS_VECTOR;
