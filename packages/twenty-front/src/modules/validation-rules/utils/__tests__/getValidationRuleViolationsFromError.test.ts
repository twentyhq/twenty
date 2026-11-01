import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getValidationRuleViolationsFromError } from '@/validation-rules/utils/getValidationRuleViolationsFromError';

const buildError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'refused', extensions }],
  });

describe('getValidationRuleViolationsFromError', () => {
  it('should return the validation rule violations the server refused the record with', () => {
    expect(
      getValidationRuleViolationsFromError(
        buildError({
          subCode: 'VALIDATION_RULE_VIOLATION',
          validationRuleViolations: [
            {
              ruleId: 'amount-rule',
              message: 'A deal needs an amount',
              fieldMetadataId: 'field-amount',
            },
            {
              ruleId: 'record-rule',
              message: 'A deal needs a company or a person',
              fieldMetadataId: null,
            },
          ],
        }),
      ),
    ).toEqual([
      {
        ruleId: 'amount-rule',
        message: 'A deal needs an amount',
        fieldMetadataId: 'field-amount',
      },
      {
        ruleId: 'record-rule',
        message: 'A deal needs a company or a person',
        fieldMetadataId: null,
      },
    ]);
  });

  it('should return nothing for rules that could not be evaluated, and for other errors', () => {
    expect(
      getValidationRuleViolationsFromError(
        buildError({
          subCode: 'VALIDATION_RULE_EVALUATION_FAILED',
          validationRuleViolations: [
            {
              ruleId: 'amount-rule',
              message: 'A deal needs an amount',
              fieldMetadataId: 'field-amount',
            },
          ],
        }),
      ),
    ).toEqual([]);
    expect(
      getValidationRuleViolationsFromError(
        buildError({ subCode: 'RECORD_NOT_FOUND' }),
      ),
    ).toEqual([]);
    expect(
      getValidationRuleViolationsFromError(new Error('Network error')),
    ).toEqual([]);
  });
});
