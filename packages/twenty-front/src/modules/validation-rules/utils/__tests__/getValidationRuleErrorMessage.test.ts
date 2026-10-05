import { getValidationRuleErrorMessage } from '@/validation-rules/utils/getValidationRuleErrorMessage';

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

  it('should return the raw message when there is no error code', () => {
    expect(
      getValidationRuleErrorMessage({ errorMessage: 'Unknown field "stage"' }),
    ).toBe('Unknown field "stage"');
  });
});
