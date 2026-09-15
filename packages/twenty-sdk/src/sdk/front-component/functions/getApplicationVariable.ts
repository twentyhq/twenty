export const getApplicationVariable = (key: string): string | undefined => {
  const raw = process.env.applicationVariables;

  if (!raw) {
    return undefined;
  }

  const variables = JSON.parse(raw) as Record<string, string>;

  return variables[key];
};
