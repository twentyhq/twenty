import { SearchQuery } from '@/ui/input/components/internal/relation-picker/types/SearchQuery';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const searchQueryScopedState = createScopedState<SearchQuery | null>({
  key: 'searchQueryScopedState',
  defaultValue: null,
});
