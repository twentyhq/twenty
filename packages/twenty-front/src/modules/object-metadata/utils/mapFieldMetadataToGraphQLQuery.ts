import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

// TODO: change ObjectMetadataItems mock before refactoring with relationDefinition computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  field,
  relationFieldDepth = 0,
  relationFieldEagerLoad,
  queryFields,
  onlyIdTypenameOnRelations,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  field: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'toRelationMetadata' | 'fromRelationMetadata'
  >;
  relationFieldDepth?: number;
  relationFieldEagerLoad?: Record<string, any>;
  queryFields?: Record<string, any>;
  onlyIdTypenameOnRelations?: boolean;
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
    ] as FieldMetadataType[]
  ).includes(fieldType);

  if (fieldIsSimpleValue) {
    return field.name;
  } else if (
    fieldType === 'RELATION' &&
    field.toRelationMetadata?.relationType === 'ONE_TO_MANY' &&
    relationFieldDepth > 0
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    const relationDepth = relationFieldDepth - 1;
    const relationIsLastDepth = relationDepth === 0;

    return `${field.name}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  eagerLoadedRelations: relationFieldEagerLoad,
  depth: relationFieldDepth - 1,
  queryFields,
  onlyIdTypenameOnThisLevel: relationIsLastDepth && onlyIdTypenameOnRelations,
})}`;
  } else if (
    fieldType === 'RELATION' &&
    field.fromRelationMetadata?.relationType === 'ONE_TO_MANY' &&
    relationFieldDepth > 0
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    const relationDepth = relationFieldDepth - 1;
    const relationIsLastDepth = relationDepth === 0;

    return `${field.name}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      eagerLoadedRelations: relationFieldEagerLoad,
      depth: relationFieldDepth - 1,
      queryFields,
      onlyIdTypenameOnThisLevel:
        relationIsLastDepth && onlyIdTypenameOnRelations,
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
  }

  return '';
};
