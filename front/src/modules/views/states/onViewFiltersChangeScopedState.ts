import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { Filter } from '@/views/components/view-bar/types/Filter';

export const onViewFiltersChangeScopedState = createScopedState<
  ((filters: Filter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
