export const SUPPORTED_SRI_ALGORITHMS = ['sha512', 'sha384', 'sha256'] as const;

export type SriAlgorithm = (typeof SUPPORTED_SRI_ALGORITHMS)[number];

export type SriDigest = { algorithm: SriAlgorithm; digest: string };

const isSupportedSriAlgorithm = (
  algorithm: string,
): algorithm is SriAlgorithm =>
  SUPPORTED_SRI_ALGORITHMS.includes(algorithm as SriAlgorithm);

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
