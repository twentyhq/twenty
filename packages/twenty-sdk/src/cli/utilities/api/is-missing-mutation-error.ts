import { serializeError } from '@/cli/utilities/error/serialize-error';

// An older server rejects an unknown mutation at validation time rather than
// with a typed error, so the CLI can only recognise it by the shape of the
// GraphQL validation message before falling back to the deprecated endpoint.
export const isMissingMutationError = (
  error: unknown,
  operationNames: string[],
): boolean => {
  const message = serializeError(error);

  return (
    operationNames.some((operationName) => message.includes(operationName)) &&
    (message.includes('Cannot query field') ||
      message.includes('Unknown type') ||
      message.includes('Unknown field'))
  );
};
