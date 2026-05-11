import { type SemverTuple } from '@/cli/utilities/version/semver-tuple';

export const compareSemver = (a: SemverTuple, b: SemverTuple): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];

  return a[2] - b[2];
};
