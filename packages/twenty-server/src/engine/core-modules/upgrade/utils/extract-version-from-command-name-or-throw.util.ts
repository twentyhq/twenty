export const extractVersionFromCommandNameOrThrow = (name: string): string => {
  const firstUnderscore = name.indexOf('_');

  if (firstUnderscore === -1) {
    throw new Error(
      `Upgrade command name "${name}" does not carry a version prefix`,
    );
  }

  return name.substring(0, firstUnderscore);
};
