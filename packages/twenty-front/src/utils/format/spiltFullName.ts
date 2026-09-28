export const splitFullName = (name: string): [string, string] => {
  const [firstName = '', secondName = ''] = name.trim().split(/\s+/);

  return [firstName, secondName];
};
