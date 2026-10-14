import { type ObjectManifest } from 'twenty-shared/application';
import { type TranslatableObjectFieldManifest } from '@/sdk/define/common/types/translatable-option-labels.type';

export type ObjectConfig = Omit<
  ObjectManifest,
  'labelIdentifierFieldMetadataUniversalIdentifier'
> & {
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
};

export type TranslatableObjectConfig = Omit<ObjectConfig, 'fields'> & {
  fields: TranslatableObjectFieldManifest[];
};
