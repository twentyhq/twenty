import { serializeError } from '@/cli/utilities/error/serialize-error';

// A server predating a mutation answers with a validation error naming the
// unknown field or type, which is what tells a newer CLI to fall back.
export const isMissingGraphqlFieldError = ({
  error,
  fieldNames,
}: {
  error: unknown;
  fieldNames: string[];
}): boolean => {
  const message = serializeError(error);

  return (
    fieldNames.some((fieldName) => message.includes(fieldName)) &&
    (message.includes('Cannot query field') ||
      message.includes('Unknown type') ||
      message.includes('Unknown field'))
  );
};
