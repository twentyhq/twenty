import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldMetadata,
} from '../FieldMetadata';

export const isFieldCurrency = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldCurrencyMetadata> =>
  field.type === FieldMetadataType.CURRENCY;
