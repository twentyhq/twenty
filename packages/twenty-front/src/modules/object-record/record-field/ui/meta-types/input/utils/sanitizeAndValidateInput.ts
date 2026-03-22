import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeAndValidateInput = (
  rawInput: string,
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string },
): { sanitizedInput: string; isValid: boolean; errorMessage: string } => {
  const sanitizedInput = rawInput.trim();

  if (!isNonEmptyString(sanitizedInput) || !isDefined(validateInput)) {
    return { sanitizedInput, isValid: true, errorMessage: '' };
  }

  const { isValid, errorMessage } = validateInput(sanitizedInput);

  return { sanitizedInput, isValid, errorMessage };
};
