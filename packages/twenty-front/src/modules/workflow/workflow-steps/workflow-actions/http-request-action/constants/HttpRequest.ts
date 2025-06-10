import { SelectOption } from 'twenty-ui/input';

export const HTTP_METHODS: SelectOption<string>[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
];

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'] as const;

export const DEFAULT_HEADERS_PLACEHOLDER =
  '{\n  "Authorization": "Bearer ..."\n}';
export const DEFAULT_BODY_PLACEHOLDER = '{\n  "key": "value"\n}';
