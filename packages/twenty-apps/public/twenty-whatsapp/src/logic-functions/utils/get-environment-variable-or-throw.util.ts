import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getEnvironmentVariableOrThrow = (name: string): string => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(
      `Missing required variable ${name}. Set it on the WhatsApp app settings.`,
    );
  }

  return value;
};
