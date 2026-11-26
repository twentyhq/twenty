const parseVersion = (version: string): number[] =>
  version
    .split(/[-+]/)[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

export const isVersionLowerThan = ({
  version,
  targetVersion,
}: {
  version: string;
  targetVersion: string;
}): boolean => {
  const parts = parseVersion(version);
  const targetParts = parseVersion(targetVersion);

  for (let index = 0; index < 3; index++) {
    const part = parts[index] ?? 0;
    const targetPart = targetParts[index] ?? 0;

    if (part !== targetPart) {
      return part < targetPart;
    }
  }

  return false;
};
