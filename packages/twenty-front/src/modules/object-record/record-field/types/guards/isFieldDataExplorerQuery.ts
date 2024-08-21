import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import {
  FieldDataExplorerQueryMetadata,
  FieldMetadata,
} from '../FieldMetadata';

export const isFieldDataExplorerQuery = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDataExplorerQueryMetadata> =>
  field.type === FieldMetadataType.DataExplorerQuery;
