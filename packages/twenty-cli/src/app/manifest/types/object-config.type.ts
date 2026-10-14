import { type ObjectManifest } from 'twenty-shared/application';
import { type TranslatableObjectFieldManifest } from '@/app/manifest/types/translatable-text.type';

export type ObjectConfig = Omit<
  ObjectManifest,
  'labelIdentifierFieldMetadataUniversalIdentifier'
> & {
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
};

export type TranslatableObjectConfig = Omit<ObjectConfig, 'fields'> & {
  fields: TranslatableObjectFieldManifest[];
};
