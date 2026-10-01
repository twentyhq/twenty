import { CustomError, isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE } from '@/host/component-source/constants/FrontComponentSourceChecksumMismatchErrorCode';
import { type CheckForNewerComponentSource } from '@/types/CheckForNewerComponentSource';

export const isNewerComponentSourceAvailable = async ({
  error,
  checkForNewerComponentSource,
}: {
  error: unknown;
  checkForNewerComponentSource?: CheckForNewerComponentSource;
}): Promise<boolean> => {
  const isChecksumMismatchError =
    error instanceof CustomError &&
    error.code === FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE;

  if (!isChecksumMismatchError || !isDefined(checkForNewerComponentSource)) {
    return false;
  }

  try {
    return (await checkForNewerComponentSource()) === true;
  } catch {
    return false;
  }
};
