import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldType } from '@/object-record/record-field/types/FieldType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useMapFieldMetadataToGraphQLQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const mapFieldMetadataToGraphQLQuery = ({
    field,
    maxDepthForRelations = 2,
    onlyTypenameAndIdOnDeepestRelationFields = false,
  }: {
    field: FieldMetadataItem;
    maxDepthForRelations?: number;
    onlyTypenameAndIdOnDeepestRelationFields?: boolean;
  }): any => {
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
        'RATING',
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

      let subfieldQuery = '';

      if (maxDepthForRelations > 0) {
        subfieldQuery = `${(relationMetadataItem?.fields ?? [])
          .map((field) =>
            mapFieldMetadataToGraphQLQuery({
              field,
              maxDepthForRelations: maxDepthForRelations - 1,
              onlyTypenameAndIdOnDeepestRelationFields,
            }),
          )
          .join('\n')}`;
      }

      return `${field.name}
    {
      __typename
      id
      ${subfieldQuery}
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

      let subfieldQuery = '';

      if (maxDepthForRelations > 0) {
        subfieldQuery = `${(relationMetadataItem?.fields ?? [])
          .map((field) =>
            mapFieldMetadataToGraphQLQuery({
              field,
              maxDepthForRelations: maxDepthForRelations - 1,
              onlyTypenameAndIdOnDeepestRelationFields,
            }),
          )
          .join('\n')}`;
      }

      return `${field.name}
    {
      __typename
      id
      ${subfieldQuery}
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

      let subfieldQuery = '';

      if (maxDepthForRelations > 0) {
        subfieldQuery = `${(relationMetadataItem?.fields ?? [])
          .map((field) =>
            mapFieldMetadataToGraphQLQuery({
              field,
              maxDepthForRelations: maxDepthForRelations - 1,
              onlyTypenameAndIdOnDeepestRelationFields,
            }),
          )
          .join('\n')}`;
      }

      return `${field.name}
      {
        edges {
          node {
            __typename
            id
            ${subfieldQuery}
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
