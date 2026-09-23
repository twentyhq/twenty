import { CustomError } from 'twenty-shared/utils';

import { computeComponentSourceChecksum } from '@/host/component-source/utils/computeComponentSourceChecksum';

export const assertComponentSourceMatchesChecksum = async ({
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
    'FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH',
  );
};
