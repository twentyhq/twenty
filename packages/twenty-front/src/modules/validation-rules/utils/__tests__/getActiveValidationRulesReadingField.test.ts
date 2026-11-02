import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { getActiveValidationRulesReadingField } from '@/validation-rules/utils/getActiveValidationRulesReadingField';

const buildRule = ({
  name,
  expression,
  isActive = true,
}: Pick<ValidationRule, 'name' | 'expression'> &
  Partial<Pick<ValidationRule, 'isActive'>>): ValidationRule => ({
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
    buildRule({ name: 'Amount', expression: 'amount.amountMicros > 0' }),
    buildRule({ name: 'Stage', expression: 'stage == "amount"' }),
    buildRule({ name: 'Off', expression: 'amount > 0', isActive: false }),
    buildRule({ name: 'Function', expression: 'isDefined(amount)' }),
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
