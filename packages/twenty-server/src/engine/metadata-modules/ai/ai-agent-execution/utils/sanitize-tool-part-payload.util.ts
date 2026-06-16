import { isNonEmptyString } from 'twenty-shared/utils';

type SanitizeToolPartPayloadInput = {
  state: string | null | undefined;
  input: unknown;
  output: unknown;
  errorText: string | null | undefined;
};

type SanitizedToolPartPayload = {
  state: string | null | undefined;
  input: unknown;
  output: unknown;
  errorText: string | null | undefined;
  wasSanitized: boolean;
};

export const sanitizeToolPartPayload = ({
  state,
  input,
  output,
  errorText,
}: SanitizeToolPartPayloadInput): SanitizedToolPartPayload => {
  let sanitizedState = state;
  let sanitizedInput = input;
  let sanitizedOutput = output;
  let sanitizedErrorText = errorText;
  let wasSanitized = false;

  if (sanitizedInput == null) {
    sanitizedInput = {};
    wasSanitized = true;
  }

  if (sanitizedState?.startsWith('output-') && sanitizedOutput == null) {
    sanitizedState = 'output-error';
    sanitizedOutput = { success: false };
    wasSanitized = true;

    if (!isNonEmptyString(sanitizedErrorText)) {
      sanitizedErrorText =
        'Tool execution failed before producing a valid output payload';
    }
  }

  return {
    state: sanitizedState,
    input: sanitizedInput,
    output: sanitizedOutput,
    errorText: sanitizedErrorText,
    wasSanitized,
  };
};
