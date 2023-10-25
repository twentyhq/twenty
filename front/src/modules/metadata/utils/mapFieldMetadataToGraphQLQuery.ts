import { FieldType } from '@/ui/data/field/types/FieldType';
import { Field } from '~/generated/graphql';

export const mapFieldMetadataToGraphQLQuery = (field: Field) => {
  // TODO: parse
  const fieldType = field.type as FieldType;

  const fieldIsSimpleValue = (
    [
      'text',
      'phone',
      'date',
      'email',
      'number',
      'boolean',
      'date',
    ] as FieldType[]
  ).includes(fieldType);

  const fieldIsURL = fieldType === 'url' || fieldType === 'urlV2';

  const fieldIsMoneyAmount =
    fieldType === 'money' || fieldType === 'moneyAmountV2';

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
