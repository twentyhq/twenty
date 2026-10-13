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

const comparePreReleaseParts = ({
  partA,
  partB,
}: {
  partA: string | undefined;
  partB: string | undefined;
}): number => {
  if (partA === undefined) {
    return -1;
  }

  if (partB === undefined) {
    return 1;
  }

  const numberA = Number(partA);
  const numberB = Number(partB);
  const areBothNumeric = !Number.isNaN(numberA) && !Number.isNaN(numberB);

  return areBothNumeric ? numberA - numberB : partA.localeCompare(partB);
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

  if (preReleaseA === undefined) {
    return 1;
  }

  if (preReleaseB === undefined) {
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
