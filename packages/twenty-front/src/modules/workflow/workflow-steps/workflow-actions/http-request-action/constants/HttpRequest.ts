export const HTTP_REQUEST_CONSTANTS = {
  METHODS: [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
  ] as const,
  METHODS_WITH_BODY: ['POST', 'PUT', 'PATCH'] as const,
  DEFAULT_JSON_BODY_PLACEHOLDER: '{\n  "key": "value"\n "another_key": "{{workflow.variable}}" \n}',
  JSON_RESPONSE_PLACEHOLDER: '{\n  Paste expected call response here to use its keys later in the workflow \n}',
  DEFAULT_OUTPUT_VALUE: {
    data: 'Configure your request above, then press "Test"',
    status: undefined,
    statusText: undefined,
    headers: {},
    duration: undefined,
    error: undefined,
  },
} as const;

export type HttpMethodWithBody = (typeof HTTP_REQUEST_CONSTANTS.METHODS_WITH_BODY)[number];

export type HttpMethod = (typeof HTTP_REQUEST_CONSTANTS.METHODS)[number]['value'];

export type HttpRequestBody = Record<string, any>;

export type HttpRequestFormData = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: HttpRequestBody | string;
};
