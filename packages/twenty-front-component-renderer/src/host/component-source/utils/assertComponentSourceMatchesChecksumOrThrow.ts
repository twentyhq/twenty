import { CustomError } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE } from '@/host/component-source/constants/FrontComponentSourceChecksumMismatchErrorCode';
import { computeComponentSourceChecksum } from '@/host/component-source/utils/computeComponentSourceChecksum';

export const assertComponentSourceMatchesChecksumOrThrow = async ({
  url,
  source,
  expectedChecksum,
}: {
  url: string;
  source: string;
  expectedChecksum: string;
}): Promise<void> => {
  const actualChecksum = await computeComponentSourceChecksum({ source });

  if (actualChecksum === expectedChecksum) {
    return;
  }

  throw new CustomError(
    `Front component source checksum mismatch for ${url}: expected ${expectedChecksum}, received ${actualChecksum}`,
    FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH_ERROR_CODE,
  );
};
