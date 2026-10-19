import { t } from '@lingui/core/macro';

export const formatFileSize = (size: number) => {
  if (size > 1024 * 1024) {
    return t`${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size > 1024) {
    return t`${(size / 1024).toFixed(1)} KB`;
  }
  return t`${size} B`;
};
