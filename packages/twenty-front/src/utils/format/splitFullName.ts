export const splitFullName = (name: string) => {
  const [firstName = '', ...lastNameWords] = name.trim().split(/\s+/);

  return [firstName, lastNameWords.join(' ')];
};
