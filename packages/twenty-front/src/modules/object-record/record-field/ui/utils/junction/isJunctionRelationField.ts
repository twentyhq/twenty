import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { hasJunctionConfig } from './hasJunctionConfig';

export const isJunctionRelationField = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings'>,
): boolean =>
  fieldMetadataItem.type === FieldMetadataType.RELATION &&
  hasJunctionConfig(fieldMetadataItem.settings);
