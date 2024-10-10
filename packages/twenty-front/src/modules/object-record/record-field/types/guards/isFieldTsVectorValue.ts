import { FieldMetadata, FieldTsVectorMetadata } from '../FieldMetadata';

import { FieldDefinition } from '../FieldDefinition';

import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTsVector = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTsVectorMetadata> =>
  field.type === FieldMetadataType.TsVector;
