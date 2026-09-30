import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';

const createCombinedGraphQLError = (
  errors: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>,
): CombinedGraphQLErrors => new CombinedGraphQLErrors({ errors, data: null });

describe('getValidationRuleSaveErrorMessage', () => {
  it('returns the reason a metadata validation rejected the rule', () => {
    const error = createCombinedGraphQLError([
      {
        message:
          'Multiple validation errors occurred while creating validation rule',
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: {
            validationRule: [
              {
                type: 'create',
                flatEntityMinimalInformation: {},
                errors: [
                  {
                    code: 'INVALID_VALIDATION_RULE_INPUT',
                    message:
                      "Validation rule error field must belong to the rule's object",
                    userFriendlyMessage:
                      "Validation rule error field must belong to the rule's object",
                  },
                ],
              },
            ],
          },
          summary: { totalErrors: 1, validationRule: 1 },
        },
      },
    ]);

    expect(getValidationRuleSaveErrorMessage(error)).toBe(
      "Validation rule error field must belong to the rule's object",
    );
  });

  it('returns the message of any other GraphQL error', () => {
    const error = createCombinedGraphQLError([
      {
        message: 'Unknown field "nope"',
        extensions: {
          code: 'BAD_USER_INPUT',
          subCode: 'INVALID_VALIDATION_RULE_EXPRESSION',
          userFriendlyMessage: 'Invalid validation rule expression.',
        },
      },
    ]);

    expect(getValidationRuleSaveErrorMessage(error)).toBe(
      'Unknown field "nope"',
    );
  });

  it('returns nothing for an error that did not come from GraphQL', () => {
    expect(
      getValidationRuleSaveErrorMessage(new Error('Network down')),
    ).toBeUndefined();
  });
});
