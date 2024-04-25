import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldDomainMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDomain = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDomainMetadata> =>
  field.type === FieldMetadataType.Domain;
