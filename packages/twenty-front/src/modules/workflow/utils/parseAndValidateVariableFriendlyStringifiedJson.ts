import { z } from 'zod';

const schema = z
  .record(z.string(), z.any())
  .refine((data) => Object.keys(data).every((key) => !key.match(/\s/)), {
    error: 'JSON keys cannot contain spaces',
  });

export const parseAndValidateVariableFriendlyStringifiedJson = (
  expectedJson: string,
) => {
  let value: unknown;

  try {
    value = JSON.parse(expectedJson);
  } catch (error) {
    return {
      isValid: false,
      error: String(error),
    } as const;
  }

  const parsingResult = schema.safeParse(value);

  if (parsingResult.success) {
    return {
      isValid: true,
      data: parsingResult.data,
    } as const;
  }

  return {
    isValid: false,
    error: parsingResult.error.issues[0].message,
  } as const;
};
