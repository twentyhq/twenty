export const HTTP_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
] as const;

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const;

export type HttpMethodWithBody = (typeof METHODS_WITH_BODY)[number];

export type HttpRequestFormData = {
  url: string;
  method: (typeof HTTP_METHODS)[number]['value'];
  headers: string | null;
  body: string | null;
};

export const DEFAULT_HEADERS_PLACEHOLDER =
  '{\n  "Authorization": "Bearer ..."\n}';
export const DEFAULT_BODY_PLACEHOLDER = '{\n  "key": "value"\n}';
