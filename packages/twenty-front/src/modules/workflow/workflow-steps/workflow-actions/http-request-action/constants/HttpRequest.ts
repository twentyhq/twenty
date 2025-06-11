import { SelectOption } from 'twenty-ui/input';

export const HTTP_METHODS: SelectOption<string>[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
];

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const;

export type HttpMethodWithBody = (typeof METHODS_WITH_BODY)[number];

export type HttpRequestFormData = {
  url: string;
  method: string;
  headers: string | null;
  body: string | null;
};

export const DEFAULT_HEADERS_PLACEHOLDER =
  '{\n  "Authorization": "Bearer ..."\n}';
export const DEFAULT_BODY_PLACEHOLDER = '{\n  "key": "value"\n}';
