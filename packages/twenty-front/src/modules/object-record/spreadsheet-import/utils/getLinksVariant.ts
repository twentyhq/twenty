import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type FieldLinksVariant,
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

export const getLinksVariant = (
  field: Pick<FieldMetadataItem, 'type' | 'settings'>,
): FieldLinksVariant | undefined =>
  field.type === FieldMetadataType.LINKS
    ? (field.settings as FieldMetadataSettings<FieldMetadataType.LINKS>)?.type
    : undefined;
