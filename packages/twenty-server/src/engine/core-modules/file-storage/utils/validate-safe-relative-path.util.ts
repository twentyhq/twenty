import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';
import { isSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/is-safe-relative-path.util';

export const validateSafeRelativePath = ({
  resourcePath,
}: {
  resourcePath: string;
}): ResourcePathValidationResult => {
  if (!isSafeRelativePath(resourcePath)) {
    return {
      isValid: false,
      error:
        'Invalid resource path: contains unsafe characters or path traversal',
    };
  }

  return { isValid: true };
};
