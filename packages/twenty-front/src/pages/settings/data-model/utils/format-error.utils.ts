import { t } from '@lingui/core/macro';

export const formatError = (errorMessage: string) => {
  const isDuplicateFieldNameInObject = errorMessage.includes(
    'duplicate key value violates unique constraint "IndexOnNameObjectMetadataIdAndWorkspaceIdUnique"',
  );

  if (isDuplicateFieldNameInObject) {
    return t`Please use different names for your source and destination fields`;
  }
  return errorMessage;
};
