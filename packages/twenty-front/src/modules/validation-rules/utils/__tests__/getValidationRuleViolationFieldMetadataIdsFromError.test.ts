import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getValidationRuleViolationFieldMetadataIdsFromError } from '@/validation-rules/utils/getValidationRuleViolationFieldMetadataIdsFromError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('getValidationRuleViolationFieldMetadataIdsFromError', () => {
  it('should return the fields targeted by the validation rule violations', () => {
    expect(
      getValidationRuleViolationFieldMetadataIdsFromError(
        buildError({
          subCode: 'VALIDATION_RULE_VIOLATION',
          validationRuleViolations: [
            { ruleId: 'amount-rule', fieldMetadataId: 'field-amount' },
            { ruleId: 'record-rule', fieldMetadataId: null },
          ],
        }),
      ),
    ).toEqual(['field-amount']);
  });

  it('should return nothing for rules that could not be evaluated, and for other errors', () => {
    expect(
      getValidationRuleViolationFieldMetadataIdsFromError(
        buildError({
          subCode: 'VALIDATION_RULE_EVALUATION_FAILED',
          validationRuleViolations: [
            { ruleId: 'amount-rule', fieldMetadataId: 'field-amount' },
          ],
        }),
      ),
    ).toEqual([]);
    expect(
      getValidationRuleViolationFieldMetadataIdsFromError(
        buildError({ subCode: 'RECORD_NOT_FOUND' }),
      ),
    ).toEqual([]);
    expect(
      getValidationRuleViolationFieldMetadataIdsFromError(
        new Error('Network error'),
      ),
    ).toEqual([]);
  });
});
