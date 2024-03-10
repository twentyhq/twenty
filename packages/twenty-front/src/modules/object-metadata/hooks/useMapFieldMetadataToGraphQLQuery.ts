import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldType } from '@/object-record/record-field/types/FieldType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useMapFieldMetadataToGraphQLQuery = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  const mapFieldMetadataToGraphQLQuery = ({
    field,
    depth = 2,
  }: {
    field: FieldMetadataItem;
    depth?: number;
  }): any => {
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
        'POSITION',
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

      if (depth > 1) {
        return `${field.name}
        {
          __typename
          id
          ${(relationMetadataItem?.fields ?? [])
            .map((field) =>
              mapFieldMetadataToGraphQLQuery({
                field,
                depth: depth - 1,
              }),
            )
            .join('\n')}
        }`;
      } else {
        return '';
      }
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_ONE'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      if (depth > 1) {
        return `${field.name}
        {
          __typename
          id
          ${(relationMetadataItem?.fields ?? [])
            .map((field) =>
              mapFieldMetadataToGraphQLQuery({
                field,
                depth: depth - 1,
              }),
            )
            .join('\n')}
        }`;
      } else {
        return '';
      }
    } else if (
      fieldType === 'RELATION' &&
      field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
      );

      if (depth > 1) {
        return `${field.name}
        {
          edges {
            node {
              __typename
              id
              ${(relationMetadataItem?.fields ?? [])
                .map((field) =>
                  mapFieldMetadataToGraphQLQuery({
                    field,
                    depth: depth - 1,
                  }),
                )
                .join('\n')}
            }
          }
        }`;
      } else {
        return '';
      }
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
