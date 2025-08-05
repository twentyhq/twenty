export type HttpRequestTestData = {
  variableValues: { [variablePath: string]: any };
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

export const DEFAULT_HTTP_REQUEST_OUTPUT_VALUE = {
  data: 'Configure your request above, then press "Test"',
  status: undefined,
  statusText: undefined,
  headers: {},
  duration: undefined,
  error: undefined,
};
