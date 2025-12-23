import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldActorMetadata, type FieldMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldActor = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldActorMetadata> =>
  field.type === FieldMetadataType.ACTOR;
