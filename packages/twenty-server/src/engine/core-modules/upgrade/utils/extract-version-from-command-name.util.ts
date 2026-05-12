export const extractVersionFromCommandName = (name: string): string | null => {
  const firstUnderscore = name.indexOf('_');

  if (firstUnderscore === -1) {
    return null;
  }

  return name.substring(0, firstUnderscore);
};
