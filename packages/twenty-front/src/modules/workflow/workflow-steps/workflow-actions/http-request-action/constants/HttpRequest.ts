export const HTTP_METHODS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
] as const;

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const;

export type HttpMethodWithBody = (typeof METHODS_WITH_BODY)[number];

export type HttpMethod = (typeof HTTP_METHODS)[number]['value'];

export type HttpRequestBody = Record<
  string,
  string | number | boolean | null | Array<string | number | boolean | null>
>;

export type HttpRequestFormData = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: HttpRequestBody;
};

export const DEFAULT_BODY_PLACEHOLDER = '{\n  "key": "value"\n}';
