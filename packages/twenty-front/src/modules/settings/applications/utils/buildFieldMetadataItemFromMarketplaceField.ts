import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { type ObjectFieldManifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const buildFieldMetadataItemFromMarketplaceField = (
  field: ObjectFieldManifest,
): FieldMetadataItem => {
  const now = new Date().toISOString();
  const universalIdentifier = field.universalIdentifier ?? uuidv4();

  return {
    id: universalIdentifier,
    universalIdentifier,
    name: field.name,
    label: field.label,
    type: (field.type as FieldMetadataType) ?? FieldMetadataType.TEXT,
    description: field.description ?? '',
    icon: field.icon ?? 'IconListDetails',
    isActive: true,
    isSystem: false,
    isNullable: true,
    isUnique: false,
    isUIEditable: true,
    createdAt: now,
    updatedAt: now,
    defaultValue: null,
    options: null,
    relation: null,
    settings: null,
  };
};
