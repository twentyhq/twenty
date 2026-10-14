import { createHash } from 'crypto';
import { createReadStream } from 'fs';

import { SRI_ALGORITHM } from 'src/engine/core-modules/application/application-registration-version/constants/sri-algorithm.constant';
import { toSriString } from 'src/engine/core-modules/application/application-registration-version/utils/to-sri-string.util';

export const computeFileSriIntegrity = async (
  filePath: string,
): Promise<string> => {
  const hash = createHash(SRI_ALGORITHM);

  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }

  return toSriString({ digest: hash.digest() });
};
