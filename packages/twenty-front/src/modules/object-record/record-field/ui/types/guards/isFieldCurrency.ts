import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldCurrency = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldCurrencyMetadata> =>
  field.type === FieldMetadataType.CURRENCY;
