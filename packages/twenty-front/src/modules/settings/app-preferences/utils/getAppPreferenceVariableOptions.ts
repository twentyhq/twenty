import { type ApplicationVariableOption } from 'twenty-shared/application';
import { z } from 'zod';

const APPLICATION_VARIABLE_OPTIONS_SCHEMA = z.array(
  z.object({ label: z.string(), value: z.string() }),
);

export const getAppPreferenceVariableOptions = (
  options: unknown,
): ApplicationVariableOption[] => {
  const result = APPLICATION_VARIABLE_OPTIONS_SCHEMA.safeParse(options);

  return result.success ? result.data : [];
};
