import { SearchQuery } from '@/object-record/relation-picker/types/SearchQuery';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const searchQueryScopedState = createStateScopeMap<SearchQuery | null>({
  key: 'searchQueryScopedState',
  defaultValue: null,
});
