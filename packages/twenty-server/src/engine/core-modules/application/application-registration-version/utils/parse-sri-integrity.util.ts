import { SUPPORTED_SRI_ALGORITHMS } from 'src/engine/core-modules/application/application-registration-version/constants/supported-sri-algorithms.constant';
import { type SriAlgorithm } from 'src/engine/core-modules/application/application-registration-version/types/sri-algorithm.type';
import { type SriDigest } from 'src/engine/core-modules/application/application-registration-version/types/sri-digest.type';

const isSupportedSriAlgorithm = (
  algorithm: string,
): algorithm is SriAlgorithm =>
  SUPPORTED_SRI_ALGORITHMS.some(
    (supportedAlgorithm) => supportedAlgorithm === algorithm,
  );

export const parseSriIntegrity = (integrity: string): SriDigest[] =>
  integrity
    .trim()
    .split(/\s+/)
    .flatMap((entry) => {
      const [algorithmAndDigest] = entry.split('?');
      const separatorIndex = algorithmAndDigest.indexOf('-');

      if (separatorIndex === -1) {
        return [];
      }

      const algorithm = algorithmAndDigest.slice(0, separatorIndex);
      const digest = algorithmAndDigest.slice(separatorIndex + 1);

      if (!isSupportedSriAlgorithm(algorithm) || digest.length === 0) {
        return [];
      }

      return [{ algorithm, digest }];
    });
