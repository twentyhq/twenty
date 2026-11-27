const OLD_NAME_SUFFIX = 'Old';
const MAX_OLD_NAME_ATTEMPTS = 100;

export const resolveAvailableOldNameSuffixes = ({
  names,
  takenNames,
}: {
  names: string[];
  takenNames: ReadonlySet<string>;
}): { nameSuffix: string; labelSuffix: string } => {
  for (let attempt = 1; attempt <= MAX_OLD_NAME_ATTEMPTS; attempt++) {
    const discriminator = attempt === 1 ? '' : `${attempt}`;
    const nameSuffix = `${OLD_NAME_SUFFIX}${discriminator}`;

    if (names.every((name) => !takenNames.has(`${name}${nameSuffix}`))) {
      return {
        nameSuffix,
        labelSuffix: attempt === 1 ? ' (Old)' : ` (Old) ${discriminator}`,
      };
    }
  }

  throw new Error(
    `Could not find an available ${OLD_NAME_SUFFIX} suffix for ${names.join(', ')} after ${MAX_OLD_NAME_ATTEMPTS} attempts`,
  );
};
