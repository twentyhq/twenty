import { isAbsolute, normalize, sep } from 'path';

import { t } from '@lingui/core/macro';

import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';

export const validateSafeRelativePath = ({
  resourcePath,
}: {
  resourcePath: string;
}): ResourcePathValidationResult => {
  if (resourcePath.length === 0) {
    return { isValid: false, error: t`Resource path must not be empty` };
  }

  if (resourcePath.includes('\0')) {
    return { isValid: false, error: t`Resource path contains null bytes` };
  }

  if (isAbsolute(resourcePath)) {
    return {
      isValid: false,
      error: t`Resource path must be relative, not absolute`,
    };
  }

  if (resourcePath.includes('\\')) {
    return {
      isValid: false,
      error: t`Resource path must not contain backslashes`,
    };
  }

  const normalized = normalize(resourcePath);

  if (normalized.split(sep).includes('..')) {
    return {
      isValid: false,
      error: t`Resource path must not contain path traversal (..)`,
    };
  }

  return { isValid: true };
};
