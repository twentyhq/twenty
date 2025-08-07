export type HttpRequestTestData = {
  variableValues: Record<string, unknown>;
  output: {
    data?: string;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    duration?: number;
    error?: string;
  };
  language: 'plaintext' | 'json';
  height: number;
};
