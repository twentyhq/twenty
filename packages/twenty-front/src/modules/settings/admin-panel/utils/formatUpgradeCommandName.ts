const TRAILING_TIMESTAMP_PATTERN = /^\d+$/;

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

  const version = commandNameParts[0];
  const timestamp = commandNameParts[commandNameParts.length - 1];

  if (!TRAILING_TIMESTAMP_PATTERN.test(timestamp)) {
    const [, ...remainingParts] = commandNameParts;

    remainingParts.pop();

    const commandLabel = remainingParts.join('_').replace(/Command$/, '');

    return `${commandLabel} (${version})`;
  }

  const className = commandNameParts.slice(1, -1).join('_');
  const isSlowInstance = className.endsWith('SlowInstanceCommand');
  const friendlyCommandName = className
    .replace(/SlowInstanceCommand$/, '')
    .replace(/FastInstanceCommand$/, '')
    .replace(/Command$/, '');
  const slowLabel = isSlowInstance ? ' (slow)' : '';

  return `${friendlyCommandName} ${timestamp} (${version})${slowLabel}`;
};
