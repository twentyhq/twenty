import { createComponentState } from 'twenty-ui';

import { SearchQuery } from '@/object-record/relation-picker/types/SearchQuery';

export const searchQueryScopedState = createComponentState<SearchQuery | null>({
  key: 'searchQueryScopedState',
  defaultValue: null,
});
