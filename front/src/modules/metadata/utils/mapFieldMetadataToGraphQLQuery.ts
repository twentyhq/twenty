import { FieldType } from '@/ui/object/field/types/FieldType';
import { Field } from '~/generated/graphql';

export const mapFieldMetadataToGraphQLQuery = (field: Field) => {
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
