import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onViewFiltersChangeScopedState = createScopedState<
  ((filters: Filter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
