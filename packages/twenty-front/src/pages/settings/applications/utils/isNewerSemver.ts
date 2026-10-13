type ParsedSemver = {
  numericParts: number[];
  preRelease: string | undefined;
};

const parseSemver = (version: string): ParsedSemver => {
  const [versionWithoutBuild] = version.trim().replace(/^v/i, '').split('+');
  const [numericVersion, ...preReleaseParts] = versionWithoutBuild.split('-');

  return {
    numericParts: numericVersion.split('.').map(Number),
    preRelease:
      preReleaseParts.length > 0 ? preReleaseParts.join('-') : undefined,
  };
};

const comparePreReleases = (
  preReleaseA: string | undefined,
  preReleaseB: string | undefined,
): number => {
  // A release always comes after its own pre-releases
  if (preReleaseA === preReleaseB) return 0;
  if (preReleaseA === undefined) return 1;
  if (preReleaseB === undefined) return -1;

  const partsA = preReleaseA.split('.');
  const partsB = preReleaseB.split('.');
  const length = Math.max(partsA.length, partsB.length);

  for (let index = 0; index < length; index++) {
    const partA = partsA[index];
    const partB = partsB[index];

    if (partA === undefined) return -1;
    if (partB === undefined) return 1;

    const numberA = Number(partA);
    const numberB = Number(partB);
    const areBothNumeric = !Number.isNaN(numberA) && !Number.isNaN(numberB);

    const comparison = areBothNumeric
      ? numberA - numberB
      : partA.localeCompare(partB);

    if (comparison !== 0) return comparison;
  }

  return 0;
};

export const isNewerSemver = (versionA: string, versionB: string): boolean => {
  const parsedA = parseSemver(versionA);
  const parsedB = parseSemver(versionB);

  for (let index = 0; index < 3; index++) {
    const partA = parsedA.numericParts[index] ?? 0;
    const partB = parsedB.numericParts[index] ?? 0;

    if (Number.isNaN(partA) || Number.isNaN(partB)) return false;
    if (partA > partB) return true;
    if (partA < partB) return false;
  }

  return comparePreReleases(parsedA.preRelease, parsedB.preRelease) > 0;
};
