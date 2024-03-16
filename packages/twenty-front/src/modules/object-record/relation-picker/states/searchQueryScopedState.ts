import { SearchQuery } from '@/object-record/relation-picker/types/SearchQuery';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const searchQueryScopedState = createComponentState<SearchQuery | null>({
  key: 'searchQueryScopedState',
  defaultValue: null,
});
