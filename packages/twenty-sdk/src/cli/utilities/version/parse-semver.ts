import { type SemverTuple } from '@/cli/utilities/version/semver-tuple';

export const parseSemver = (raw: string): SemverTuple | null => {
  const trimmed = raw.replace(/^v/, '').trim();
  const match = trimmed.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    return null;
  }

  return [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ];
};
