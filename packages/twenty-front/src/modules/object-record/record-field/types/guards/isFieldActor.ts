import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldActorMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldActor = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldActorMetadata> =>
  field.type === FieldMetadataType.Actor;
