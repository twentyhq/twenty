import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER =
  '46ebae6d-27ab-425f-b60e-1feac27cc45b';

export default defineField({
  universalIdentifier: BUDGET_MIN_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'budgetMin',
  label: 'Budget min',
  description: 'Buyer minimum budget',
  icon: 'IconCurrencyEuro',
  isNullable: true,
});
