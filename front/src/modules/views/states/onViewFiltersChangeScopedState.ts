import { Filter } from '@/ui/data/view-bar/types/Filter';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onViewFiltersChangeScopedState = createScopedState<
  ((filters: Filter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
