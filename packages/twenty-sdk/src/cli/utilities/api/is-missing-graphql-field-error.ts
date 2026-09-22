import { serializeError } from '@/cli/utilities/error/serialize-error';

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
