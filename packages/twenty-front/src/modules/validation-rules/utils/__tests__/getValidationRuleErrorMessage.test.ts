import { getValidationRuleErrorMessage } from '@/validation-rules/utils/getValidationRuleErrorMessage';
import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';

const OPPORTUNITY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'people',
        type: FieldMetadataType.RELATION,
        universalIdentifier: 'company-people',
        relationType: RelationType.ONE_TO_MANY,
      },
    ],
  },
  {
    name: 'pointOfContacts',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-point-of-contacts',
    relationType: RelationType.ONE_TO_MANY,
  },
];

describe('getValidationRuleErrorMessage', () => {
  it('should return the message for a known error code', () => {
    expect(
      getValidationRuleErrorMessage({
        errorCode: 'BRACKET_ACCESS',
        errorMessage: 'raw message',
      }),
    ).toBe('Bracket access is not supported, use dot access instead');

    expect(
      getValidationRuleErrorMessage({
        errorCode: 'NON_BOOLEAN_RESULT',
        errorMessage: 'raw message',
      }),
    ).toBe('Expression did not return true or false');
  });

  it('should put the error params back into the message', () => {
    expect(
      getValidationRuleErrorMessage({
        errorCode: 'UNKNOWN_RELATION_TARGET_FIELD',
        errorParams: { fieldName: 'size', relationFieldName: 'company' },
        errorMessage: 'raw message',
      }),
    ).toBe('Unknown field "size" on "company"');

    expect(
      getValidationRuleErrorMessage({
        errorCode: 'EXPRESSION_TOO_LONG',
        errorParams: { maxLength: 2000 },
        errorMessage: 'raw message',
      }),
    ).toBe('Expression is longer than 2000 characters');
  });

  it('should match the English message of every coded compiler error', () => {
    const expressions = [
      '   ',
      `stage == "${'x'.repeat(2000)}"`,
      'stage["value"] == "WON"',
      'amount . amountMicros > 0',
      'now.date > 0',
      'closeDate > now',
      'amount.value > 0',
      'amount.amountMicros.value > 0',
      'isDefined(pointOfContacts)',
      'isDefined(company.size)',
      'isDefined(company.people)',
      'stage',
    ];

    for (const expression of expressions) {
      const compilationResult = compileValidationRuleExpression({
        expression,
        fields: OPPORTUNITY_FIELDS,
      });

      if (compilationResult.isValid) {
        throw new Error(`Expected "${expression}" to be invalid`);
      }

      expect(compilationResult.errorCode).toBeDefined();
      expect(getValidationRuleErrorMessage(compilationResult)).toBe(
        compilationResult.errorMessage,
      );
    }
  });

  it('should return the raw message when there is no error code', () => {
    expect(
      getValidationRuleErrorMessage({ errorMessage: 'Unexpected token' }),
    ).toBe('Unexpected token');
  });
});
