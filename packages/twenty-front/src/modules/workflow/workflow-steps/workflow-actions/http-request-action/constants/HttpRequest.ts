const {
  HTTP_METHODS,
  METHODS_WITH_BODY,
  DEFAULT_JSON_BODY_PLACEHOLDER,
  DEFAULT_HTTP_REQUEST_OUTPUT_VALUE,
  BODY_TYPES,
} = {
  HTTP_METHODS: [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
  ] as const,
  METHODS_WITH_BODY: ['POST', 'PUT', 'PATCH'] as const,
  DEFAULT_JSON_BODY_PLACEHOLDER:
    '{\n  "key": "value"\n "another_key": "{{workflow.variable}}" \n}',
  DEFAULT_HTTP_REQUEST_OUTPUT_VALUE: {
    data: undefined,
    status: undefined,
    statusText: undefined,
    headers: {},
    duration: undefined,
    error: undefined,
  },
  BODY_TYPES: {
    KEY_VALUE: 'keyValue',
    RAW_JSON: 'rawJson',
    FORM_DATA: 'formData',
    TEXT: 'text',
    NONE: 'none',
  } as const,
};

export type HttpMethodWithBody = (typeof METHODS_WITH_BODY)[number];

export type HttpMethod = (typeof HTTP_METHODS)[number]['value'];

export type HttpRequestBody = Record<string, any>;

export type HttpRequestFormData = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: HttpRequestBody | string;
};

export {
  BODY_TYPES,
  DEFAULT_HTTP_REQUEST_OUTPUT_VALUE,
  DEFAULT_JSON_BODY_PLACEHOLDER,
  HTTP_METHODS,
  METHODS_WITH_BODY,
};
