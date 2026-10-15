import { createHash } from 'crypto';

import { SRI_ALGORITHM } from 'src/engine/core-modules/application/application-registration-version/constants/sri-algorithm.constant';
import { type SriAlgorithm } from 'src/engine/core-modules/application/application-registration-version/types/sri-algorithm.type';
import { toSriString } from 'src/engine/core-modules/application/application-registration-version/utils/to-sri-string.util';

export const computeSriIntegrity = ({
  source,
  algorithm = SRI_ALGORITHM,
}: {
  source: Buffer;
  algorithm?: SriAlgorithm;
}): string =>
  toSriString({
    digest: createHash(algorithm).update(source).digest(),
    algorithm,
  });
