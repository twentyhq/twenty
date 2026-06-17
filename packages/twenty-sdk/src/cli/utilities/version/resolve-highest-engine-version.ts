import semver from 'semver';

import { getEngineVersionRange } from '@/cli/utilities/version/get-engine-version-range';
import { getPublishedServerVersions } from '@/cli/utilities/version/get-published-server-versions';

export const resolveHighestEngineVersion = async (
  explicitVersion?: string,
): Promise<string> => {
  const explicit = explicitVersion?.trim();

  if (explicit) {
    return explicit;
  }

  const range = getEngineVersionRange();

  if (range === null || semver.validRange(range) === null) {
    return 'latest';
  }

  const published = await getPublishedServerVersions();

  const bestMatch = published
    .map((version) => version.name)
    .filter((name) => semver.valid(name) !== null)
    .filter((name) => semver.satisfies(name, range))
    .sort(semver.rcompare)[0];

  return bestMatch ?? 'latest';
};
