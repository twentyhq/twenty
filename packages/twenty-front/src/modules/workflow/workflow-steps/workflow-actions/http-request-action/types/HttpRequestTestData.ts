export type HttpRequestTestData = {
  variableValues: { [variablePath: string]: any };
  output: {
    data?: string | null;
    status?: number | null;
    statusText?: string | null;
    headers?: Record<string, string> | null;
    duration?: number | null;
    error?: string | null;
  };
  language: 'plaintext' | 'json';
  height: number;
};
