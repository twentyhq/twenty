import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

// required means present, as in JSON Schema: a null or empty value is the tool's to accept or refuse
export const findMissingRequiredToolArguments = ({
  inputSchema,
  toolArguments,
}: {
  inputSchema: unknown;
  toolArguments: Record<string, unknown>;
}): string[] => {
  if (!isPlainObject(inputSchema) || !Array.isArray(inputSchema.required)) {
    return [];
  }

  const presentArgumentNames = new Set(
    Object.entries(toolArguments)
      .filter(([, value]) => value !== undefined)
      .map(([argumentName]) => argumentName),
  );

  return [...new Set(inputSchema.required.filter(isString))].filter(
    (argumentName) => !presentArgumentNames.has(argumentName),
  );
};
