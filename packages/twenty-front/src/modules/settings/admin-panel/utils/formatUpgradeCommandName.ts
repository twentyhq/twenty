export const formatUpgradeCommandName = (
  commandName: string | null | undefined,
): string | null => {
  if (!commandName) {
    return null;
  }

  const commandNameParts = commandName.split('_');

  if (commandNameParts.length < 3) {
    return commandName;
  }

  const [version, ...remainingParts] = commandNameParts;

  remainingParts.pop();

  const commandLabel = remainingParts.join('_').replace(/Command$/, '');

  return `${commandLabel} (${version})`;
};
