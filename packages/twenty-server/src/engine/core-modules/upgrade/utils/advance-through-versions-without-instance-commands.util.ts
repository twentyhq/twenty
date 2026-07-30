// A release that ships no instance command leaves nothing for the instance
// cursor to land on, so the instance version would stay stuck on the previous
// release forever. Such versions have no instance-level work to do, so they are
// reached as soon as the last version that does have instance commands is done.
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

  // The upgrade sequence is built from the supported versions, so a version
  // resolved out of it always belongs to them.
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
