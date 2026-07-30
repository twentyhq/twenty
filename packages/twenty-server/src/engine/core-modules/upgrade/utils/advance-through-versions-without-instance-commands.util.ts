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

  if (completedVersionIndex === -1) {
    return completedVersion;
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
