const MAX_NAME_SUFFIX = 9;

export const findAvailableMcpServerName = ({
  name,
  takenNames,
}: {
  name: string;
  takenNames: string[];
}): string =>
  [
    name,
    ...Array.from(
      { length: MAX_NAME_SUFFIX - 1 },
      (_, index) => `${name}_${index + 2}`,
    ),
  ].find((candidate) => !takenNames.includes(candidate)) ?? name;
