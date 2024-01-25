import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldType } from '@/object-record/field/types/FieldType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useMapFieldMetadataToGraphQLQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const mapFieldMetadataToGraphQLQuery = (
    field: FieldMetadataItem,
    maxDepthForRelations: number = 2,
  ): any => {
    if (maxDepthForRelations <= 0) {
      return '';
    }

    // TODO: parse
    const fieldType = field.type as FieldType;

    const fieldIsSimpleValue = (
      [
        'UUID',
        'TEXT',
        'PHONE',
        'DATE_TIME',
        'EMAIL',
        'NUMBER',
        'BOOLEAN',
        'SELECT',
      ] as FieldType[]
    ).includes(fieldType);

    if (fieldIsSimpleValue) {
      return field.name;
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .map((field) =>
          mapFieldMetadataToGraphQLQuery(field, maxDepthForRelations - 1),
        )
        .join('\n')}
    }`;
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_ONE'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .map((field) =>
          mapFieldMetadataToGraphQLQuery(field, maxDepthForRelations - 1),
        )
        .join('\n')}
    }`;
    } else if (
      fieldType === 'RELATION' &&
      field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
      );

      return `${field.name}
      {
        edges {
          node {
            id
            ${(relationMetadataItem?.fields ?? [])
              .map((field) =>
                mapFieldMetadataToGraphQLQuery(field, maxDepthForRelations - 1),
              )
              .join('\n')}
          }
        }
      }`;
    } else if (fieldType === 'LINK') {
      return `
      ${field.name}
      {
        label
        url
      }
    `;
    } else if (fieldType === 'CURRENCY') {
      return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
    } else if (fieldType === 'FULL_NAME') {
      return `
      ${field.name}
      {
        firstName
        lastName
      }
    `;
    }
  };

  return mapFieldMetadataToGraphQLQuery;
};
