import { t } from '@lingui/core/macro';

import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';

const MAX_SEGMENT_LENGTH = 255;
const MAX_PATH_LENGTH = 1024;
const SAFE_SEGMENT_PATTERN = /^[a-zA-Z0-9._-]+$/;

export const validatePathSegmentsSafety = ({
  resourcePath,
}: {
  resourcePath: string;
}): ResourcePathValidationResult => {
  if (resourcePath.length > MAX_PATH_LENGTH) {
    return {
      isValid: false,
      error: t`Resource path exceeds maximum length of ${MAX_PATH_LENGTH} characters`,
    };
  }

  if (resourcePath.includes('//') || resourcePath.endsWith('/')) {
    return {
      isValid: false,
      error: t`Resource path must not contain empty segments or trailing slashes`,
    };
  }

  const segments = resourcePath.split('/');

  for (const segment of segments) {
    if (segment.length > MAX_SEGMENT_LENGTH) {
      return {
        isValid: false,
        error: t`A path segment exceeds the maximum length of 255 characters`,
      };
    }

    if (!SAFE_SEGMENT_PATTERN.test(segment)) {
      return {
        isValid: false,
        error: t`A path segment contains invalid characters. Only alphanumeric, dots, dashes and underscores are allowed`,
      };
    }
  }

  return { isValid: true };
};
