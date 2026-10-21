import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';

import { classifyMetadataError } from '@/metadata-error-handler/utils/classifyMetadataError';

export const getValidationRuleSaveErrorMessage = (
  error: unknown,
): string | undefined => {
  if (!(error instanceof CombinedGraphQLErrors)) {
    return undefined;
  }

  const classification = classifyMetadataError({
    error,
    primaryMetadataName: 'validationRule',
  });

  if (classification.type === 'v2-validation') {
    const validationError =
      classification.extensions.errors.validationRule?.[0]?.errors[0];

    if (isDefined(validationError)) {
      return validationError.userFriendlyMessage ?? validationError.message;
    }
  }

  return error.errors[0]?.message;
};
