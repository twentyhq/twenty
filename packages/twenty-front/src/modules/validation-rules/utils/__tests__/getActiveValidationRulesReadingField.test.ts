import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { getActiveValidationRulesReadingField } from '@/validation-rules/utils/getActiveValidationRulesReadingField';

const buildRule = (
  name: string,
  expression: string,
  isActive = true,
): ValidationRule => ({
  id: name,
  objectMetadataId: 'object-metadata-id',
  name,
  description: null,
  icon: null,
  errorFieldMetadataId: null,
  expression,
  message: 'Message',
  isActive,
});

describe('getActiveValidationRulesReadingField', () => {
  const validationRules = [
    buildRule('Amount', 'amount.amountMicros > 0'),
    buildRule('Stage', 'stage == "amount"'),
    buildRule('Off', 'amount > 0', false),
    buildRule('Function', 'isDefined(amount)'),
  ];

  it('should find active rules reading the field or one of its subfields, but not a text with its name', () => {
    expect(
      getActiveValidationRulesReadingField({
        validationRules,
        fieldName: 'amount',
      }).map(({ name }) => name),
    ).toEqual(['Amount', 'Function']);
  });
});
