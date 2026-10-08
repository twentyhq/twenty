import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

export const isOnDemandField = (
  field: Pick<FieldMetadataItem, 'type' | 'settings'>,
): boolean =>
  field.type === FieldMetadataType.RAW_JSON &&
  (field.settings?.isValueLoadedOnOpen ?? false);
