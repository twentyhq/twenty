import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

// TODO: change ObjectMetadataItems mock before refactoring with relationDefinition computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  field,
  depth = 0,
  queryFields,
  computeReferences = false,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  field: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'toRelationMetadata' | 'fromRelationMetadata'
  >;
  depth?: number;
  queryFields?: Record<string, any>;
  computeReferences?: boolean;
}): any => {
  const fieldType = field.type;

  const fieldIsSimpleValue = (
    [
      'UUID',
      'TEXT',
      'PHONE',
      'DATE_TIME',
      'EMAIL',
      'NUMBER',
      'BOOLEAN',
      'RATING',
      'SELECT',
      'POSITION',
      'RAW_JSON',
    ] as FieldMetadataType[]
  ).includes(fieldType);

  if (fieldIsSimpleValue) {
    return field.name;
  } else if (
    fieldType === 'RELATION' &&
    field.toRelationMetadata?.relationType === 'ONE_TO_MANY' &&
    depth > 0
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  depth: depth - 1,
  queryFields,
  computeReferences: computeReferences,
  isRootLevel: false,
})}`;
  } else if (
    fieldType === 'RELATION' &&
    field.fromRelationMetadata?.relationType === 'ONE_TO_MANY' &&
    depth > 0
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      depth: depth - 1,
      queryFields,
      computeReferences,
      isRootLevel: false,
    })}
  }
}`;
  } else if (fieldType === 'LINK') {
    return `${field.name}
{
  label
  url
}`;
  } else if (fieldType === 'CURRENCY') {
    return `${field.name}
{
  amountMicros
  currencyCode
}
    `;
  } else if (fieldType === 'FULL_NAME') {
    return `${field.name}
{
  firstName
  lastName
}`;
  } else if (fieldType === 'ADDRESS') {
    return `${field.name}
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}`;
  }

  return '';
};
