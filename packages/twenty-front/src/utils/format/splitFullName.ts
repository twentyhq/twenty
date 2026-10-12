export const splitFullName = (name: string) => {
  const splittedName = name.trim().split(/\s+/);

  if (splittedName.length === 2) {
    return splittedName;
  }

  if (splittedName.length > 2) {
    return [splittedName[0].trim(), splittedName[1].trim()];
  }

  return [name.trim(), ''];
};
