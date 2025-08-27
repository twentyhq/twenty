import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldActorMetadata, type FieldMetadata } from '../FieldMetadata';

export const isFieldActor = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldActorMetadata> =>
  field.type === FieldMetadataType.ACTOR;
