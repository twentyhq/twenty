// Application variables are injected into process.env on every execution.
export const getApplicationVariableValue = (key: string): string | undefined =>
  process.env[key];
