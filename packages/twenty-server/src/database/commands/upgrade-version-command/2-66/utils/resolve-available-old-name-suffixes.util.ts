const OLD_NAME_SUFFIX = 'Old';
const OLD_LABEL_SUFFIX = ' (Old)';

export const resolveAvailableOldNameSuffixes = ({
  names,
  takenNames,
}: {
  names: string[];
  takenNames: ReadonlySet<string>;
}): { nameSuffix: string; labelSuffix: string } => {
  let attempt = 1;
  let nameSuffix = OLD_NAME_SUFFIX;

  while (names.some((name) => takenNames.has(`${name}${nameSuffix}`))) {
    attempt++;
    nameSuffix = `${OLD_NAME_SUFFIX}${attempt}`;
  }

  return {
    nameSuffix,
    labelSuffix:
      attempt === 1 ? OLD_LABEL_SUFFIX : `${OLD_LABEL_SUFFIX} ${attempt}`,
  };
};
