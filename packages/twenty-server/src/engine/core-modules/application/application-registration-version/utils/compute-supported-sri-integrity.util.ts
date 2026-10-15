import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { SUPPORTED_SRI_ALGORITHMS } from 'src/engine/core-modules/application/application-registration-version/constants/supported-sri-algorithms.constant';

export const computeSupportedSriIntegrity = (source: Buffer): string =>
  SUPPORTED_SRI_ALGORITHMS.map((algorithm) =>
    computeSriIntegrity({ source, algorithm }),
  ).join(' ');
