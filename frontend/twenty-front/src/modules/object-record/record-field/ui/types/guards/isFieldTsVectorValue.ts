import {
  type FieldMetadata,
  type FieldTsVectorMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';

import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTsVector = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTsVectorMetadata> =>
  field.type === FieldMetadataType.TS_VECTOR;
