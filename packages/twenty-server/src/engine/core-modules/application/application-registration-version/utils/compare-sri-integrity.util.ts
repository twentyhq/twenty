import { isDefined } from 'twenty-shared/utils';

import {
  parseSriIntegrity,
  SUPPORTED_SRI_ALGORITHMS,
} from 'src/engine/core-modules/application/application-registration-version/utils/parse-sri-integrity.util';

export type SriIntegrityComparison = 'match' | 'mismatch' | 'incomparable';

export const compareSriIntegrity = (
  expected: string,
  actual: string,
): SriIntegrityComparison => {
  const expectedDigests = parseSriIntegrity(expected);
  const actualDigests = parseSriIntegrity(actual);

  const sharedAlgorithm = SUPPORTED_SRI_ALGORITHMS.find(
    (algorithm) =>
      expectedDigests.some((sriDigest) => sriDigest.algorithm === algorithm) &&
      actualDigests.some((sriDigest) => sriDigest.algorithm === algorithm),
  );

  if (!isDefined(sharedAlgorithm)) {
    return 'incomparable';
  }

  const expectedDigestsForAlgorithm = expectedDigests
    .filter((sriDigest) => sriDigest.algorithm === sharedAlgorithm)
    .map((sriDigest) => sriDigest.digest);

  const isMatching = actualDigests.some(
    (sriDigest) =>
      sriDigest.algorithm === sharedAlgorithm &&
      expectedDigestsForAlgorithm.includes(sriDigest.digest),
  );

  return isMatching ? 'match' : 'mismatch';
};
