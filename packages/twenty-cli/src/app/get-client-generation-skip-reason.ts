import { lstat } from 'node:fs/promises';

import { getClientSdkPackagePath } from '@/app/get-client-sdk-package-path';
import { hasErrorCode } from '@/utils/has-error-code';

export const getClientGenerationSkipReason = async ({
  appPath,
}: {
  appPath: string;
}) => {
  const isClientPackageMissing = await lstat(
    getClientSdkPackagePath({ appPath }),
  ).then(
    () => false,
    (error: unknown) => hasErrorCode(error, 'ENOENT'),
  );

  if (isClientPackageMissing) {
    return "twenty-client-sdk is not installed in the app's own node_modules.";
  }

  return undefined;
};
