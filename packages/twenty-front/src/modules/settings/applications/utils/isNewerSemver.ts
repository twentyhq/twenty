import { isDefined } from 'twenty-shared/utils';

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

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/;

const comparePreReleaseParts = ({
  partA,
  partB,
}: {
  partA: string | undefined;
  partB: string | undefined;
}): number => {
  if (!isDefined(partA)) {
    return -1;
  }

  if (!isDefined(partB)) {
    return 1;
  }

  const isNumericA = NUMERIC_IDENTIFIER_REGEX.test(partA);
  const isNumericB = NUMERIC_IDENTIFIER_REGEX.test(partB);

  if (isNumericA && isNumericB) {
    return Number(partA) - Number(partB);
  }

  if (isNumericA !== isNumericB) {
    return isNumericA ? -1 : 1;
  }

  if (partA === partB) {
    return 0;
  }

  return partA < partB ? -1 : 1;
};

const comparePreReleases = ({
  preReleaseA,
  preReleaseB,
}: {
  preReleaseA: string | undefined;
  preReleaseB: string | undefined;
}): number => {
  if (preReleaseA === preReleaseB) {
    return 0;
  }

  if (!isDefined(preReleaseA)) {
    return 1;
  }

  if (!isDefined(preReleaseB)) {
    return -1;
  }

  const partsA = preReleaseA.split('.');
  const partsB = preReleaseB.split('.');
  const length = Math.max(partsA.length, partsB.length);

  for (let index = 0; index < length; index++) {
    const comparison = comparePreReleaseParts({
      partA: partsA[index],
      partB: partsB[index],
    });

    if (comparison !== 0) {
      return comparison;
    }
  }

  return 0;
};

export const isNewerSemver = (versionA: string, versionB: string): boolean => {
  const parsedA = parseSemver(versionA);
  const parsedB = parseSemver(versionB);

  for (let index = 0; index < 3; index++) {
    const partA = parsedA.numericParts[index] ?? 0;
    const partB = parsedB.numericParts[index] ?? 0;

    if (Number.isNaN(partA) || Number.isNaN(partB)) {
      return false;
    }

    if (partA !== partB) {
      return partA > partB;
    }
  }

  return (
    comparePreReleases({
      preReleaseA: parsedA.preRelease,
      preReleaseB: parsedB.preRelease,
    }) > 0
  );
};
