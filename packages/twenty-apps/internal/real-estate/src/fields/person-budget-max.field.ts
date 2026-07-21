import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const BUDGET_MAX_FIELD_UNIVERSAL_IDENTIFIER =
  '85717714-a03b-4f7a-a13e-504f4e60d588';

export default defineField({
  universalIdentifier: BUDGET_MAX_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'budgetMax',
  label: 'Budget max',
  description: 'Buyer maximum budget',
  icon: 'IconCurrencyEuro',
  isNullable: true,
});
