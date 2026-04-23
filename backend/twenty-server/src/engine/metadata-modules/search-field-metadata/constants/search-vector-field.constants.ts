import { msg } from '@lingui/core/macro';

export const SEARCH_VECTOR_FIELD = {
  name: 'searchVector',
  label: msg`Search vector`,
  description: msg`Field used for full-text search`,
} as const;
