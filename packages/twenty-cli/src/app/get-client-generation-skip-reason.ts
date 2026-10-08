import { lstat } from 'node:fs/promises';
import { join } from 'node:path';

import { hasErrorCode } from '@/utils/has-error-code';

export const getClientGenerationSkipReason = async ({
  appPath,
}: {
  appPath: string;
}) => {
  const isClientPackageMissing = await lstat(
    join(appPath, 'node_modules', 'twenty-client-sdk'),
  ).then(
    () => false,
    (error: unknown) => hasErrorCode(error, 'ENOENT'),
  );

  if (isClientPackageMissing) {
    return "twenty-client-sdk is not installed in the app's own node_modules.";
  }

  return undefined;
};
