export const getApplicationVariableValue = (key: string): string | undefined =>
  process.env[key];
