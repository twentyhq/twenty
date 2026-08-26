export const isUpgradeSequenceCursorAtOrAfterCommand = ({
  commandName,
  cursorName,
  sequence,
}: {
  commandName: string;
  cursorName: string;
  sequence: { name: string }[];
}): boolean => {
  const commandIndex = sequence.findIndex(({ name }) => name === commandName);
  const cursorIndex = sequence.findIndex(({ name }) => name === cursorName);

  return commandIndex !== -1 && cursorIndex >= commandIndex;
};
