import { createHash } from 'crypto';
import { createReadStream } from 'fs';

import {
  SRI_ALGORITHM,
  toSriString,
} from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

export const computeFileSriIntegrity = async (
  filePath: string,
): Promise<string> => {
  const hash = createHash(SRI_ALGORITHM);

  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }

  return toSriString(hash.digest());
};
