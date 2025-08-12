import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { FieldMetadataType } from 'twenty-shared/types';
import { type FieldMetadataItem } from '../types/FieldMetadataItem';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';

export type FieldMetadataItemAsFieldDefinitionProps = {
  field: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  showLabel?: boolean;
  labelWidth?: number;
};

export const formatFieldMetadataItemAsFieldDefinition = ({
  field,
  objectMetadataItem,
  showLabel,
  labelWidth,
}: FieldMetadataItemAsFieldDefinitionProps): FieldDefinition<FieldMetadata> => {
  const isRelation = field.type === FieldMetadataType.RELATION;
  const isMorphRelation = field.type === FieldMetadataType.MORPH_RELATION;

  const relationType = isRelation
    ? field.relation?.type
    : isMorphRelation
      ? field.morphRelations?.[0]?.type
      : undefined;

  const morphRelations = isMorphRelation
    ? field.morphRelations?.map((morphRelation) => ({
        targetFieldMetadataName: morphRelation.targetFieldMetadata?.name,
        relationObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata?.nameSingular,
        relationObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata?.namePlural,
        relationObjectMetadataId: morphRelation.targetObjectMetadata?.id,
        relationFieldMetadataId: morphRelation.targetFieldMetadata?.id,
      }))
    : [];

  const fieldDefinitionMetadata = {
    fieldName: field.name,
    placeHolder: field.label,
    relationType,
    morphRelations,
    relationFieldMetadataId: field.relation?.targetFieldMetadata.id,
    relationObjectMetadataNameSingular:
      field.relation?.targetObjectMetadata?.nameSingular ?? '',
    relationObjectMetadataNamePlural:
      field.relation?.targetObjectMetadata?.namePlural ?? '',
    relationObjectMetadataId: field.relation?.targetObjectMetadata?.id ?? '',
    objectMetadataNameSingular: objectMetadataItem.nameSingular ?? '',
    targetFieldMetadataName: field.relation?.targetFieldMetadata?.name ?? '',
    options: field.options,
    settings: field.settings,
    isNullable: field.isNullable,
    isCustom: field.isCustom ?? false,
  };

  return {
    fieldMetadataId: field.id,
    label: field.label,
    showLabel,
    labelWidth,
    type: field.type,
    metadata: fieldDefinitionMetadata,
    iconName: field.icon ?? 'Icon123',
    defaultValue: field.defaultValue,
    editButtonIcon: getFieldButtonIcon({
      metadata: fieldDefinitionMetadata,
      type: field.type,
    }),
  };
};
