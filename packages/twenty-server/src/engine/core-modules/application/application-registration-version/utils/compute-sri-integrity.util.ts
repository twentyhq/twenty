import { createHash } from 'crypto';

import {
  type SriAlgorithm,
  SUPPORTED_SRI_ALGORITHMS,
} from 'src/engine/core-modules/application/application-registration-version/utils/parse-sri-integrity.util';

export const SRI_ALGORITHM: SriAlgorithm = 'sha512';

export const toSriString = ({
  digest,
  algorithm = SRI_ALGORITHM,
}: {
  digest: Buffer;
  algorithm?: SriAlgorithm;
}): string => `${algorithm}-${digest.toString('base64')}`;

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

export const computeSupportedSriIntegrity = (source: Buffer): string =>
  SUPPORTED_SRI_ALGORITHMS.map((algorithm) =>
    computeSriIntegrity({ source, algorithm }),
  ).join(' ');
