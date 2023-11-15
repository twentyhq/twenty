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

    const fieldIsURL = fieldType === 'URL' || fieldType === 'URL_V2';

    const fieldIsMoneyAmount =
      fieldType === 'MONEY' || fieldType === 'MONEY_AMOUNT_V2';

    if (fieldIsSimpleValue) {
      return field.name;
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      console.log({ objectMetadataItems, field });

      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      console.log({ relationMetadataItem });

      return `${field.name}
    {
      id
      ${relationMetadataItem?.fields
        .filter((field) => field.type !== 'RELATION')
        .map((field) => field.name)
        .join('\n')}
    }`;
    } else if (
      fieldType === 'RELATION' &&
      field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      return `${field.name}
      {
        edges {
          node {
           id
          }
        }
      }`;
    } else if (fieldIsURL) {
      return `
      ${field.name}
      {
        text
        link
      }
    `;
    } else if (fieldIsMoneyAmount) {
      return `
      ${field.name}
      {
        amount
        currency
      }
    `;
    }
  };

  return mapFieldMetadataToGraphQLQuery;
};
