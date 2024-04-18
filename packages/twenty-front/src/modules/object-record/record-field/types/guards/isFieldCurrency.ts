import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldCurrencyMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldCurrency = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldCurrencyMetadata> =>
  field.type === FieldMetadataType.Currency;
