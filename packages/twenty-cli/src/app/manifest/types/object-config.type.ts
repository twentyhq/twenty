import { type ObjectManifest } from 'twenty-shared/application';
import { type TranslatableObjectFieldManifest } from '@/app/manifest/types/translatable-text.type';

export type ObjectConfig = Omit<
  ObjectManifest,
  'labelIdentifierFieldMetadataUniversalIdentifier' | 'fields'
> & {
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
  fields: TranslatableObjectFieldManifest[];
};
