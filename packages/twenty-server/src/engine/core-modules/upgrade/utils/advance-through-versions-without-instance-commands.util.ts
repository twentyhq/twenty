export const advanceThroughVersionsWithoutInstanceCommands = ({
  completedVersion,
  supportedVersions,
  versionsWithInstanceCommands,
}: {
  completedVersion: string;
  supportedVersions: readonly string[];
  versionsWithInstanceCommands: Set<string>;
}): string => {
  const completedVersionIndex = supportedVersions.indexOf(completedVersion);

  if (completedVersionIndex === -1) {
    throw new Error(
      `Completed upgrade version "${completedVersion}" is not one of the supported versions [${supportedVersions.join(', ')}]`,
    );
  }

  let reachedVersion = completedVersion;

  for (const version of supportedVersions.slice(completedVersionIndex + 1)) {
    if (versionsWithInstanceCommands.has(version)) {
      break;
    }

    reachedVersion = version;
  }

  return reachedVersion;
};
