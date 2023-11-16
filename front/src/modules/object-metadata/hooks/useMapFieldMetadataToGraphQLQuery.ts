import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { FieldType } from '@/ui/object/field/types/FieldType';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useMapFieldMetadataToGraphQLQuery = () => {
  const { objectMetadataItems } = useFindManyObjectMetadataItems();

  const mapFieldMetadataToGraphQLQuery = (field: FieldMetadataItem): any => {
    // TODO: parse
    const fieldType = field.type as FieldType;

    const fieldIsSimpleValue = (
      [
        'TEXT',
        'PHONE',
        'DATE',
        'EMAIL',
        'NUMBER',
        'BOOLEAN',
        'DATE',
      ] as FieldType[]
    ).includes(fieldType);

    const fieldIsLink = fieldType === 'URL' || fieldType === 'LINK';

    const fieldIsCurrencyAmount =
      fieldType === 'MONEY' || fieldType === 'CURRENCY';

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
        .filter((field) => field.type !== 'RELATION')
        .map((field) => field.name)
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
              .filter((field) => field.type !== 'RELATION')
              .map((field) => field.name)
              .join('\n')}
          }
        }
      }`;
    } else if (fieldIsLink) {
      return `
      ${field.name}
      {
        label
        url
      }
    `;
    } else if (fieldIsCurrencyAmount) {
      return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
    }
  };

  return mapFieldMetadataToGraphQLQuery;
};
