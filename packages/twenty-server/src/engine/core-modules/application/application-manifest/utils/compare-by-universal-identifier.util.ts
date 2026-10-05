import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';

export const compareByUniversalIdentifier = (
  left: { universalIdentifier: string },
  right: { universalIdentifier: string },
): number =>
  compareByCodePoint(left.universalIdentifier, right.universalIdentifier);
