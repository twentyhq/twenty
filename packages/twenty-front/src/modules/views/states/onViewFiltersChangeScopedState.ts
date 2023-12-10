import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { ViewFilter } from '@/views/types/ViewFilter';

export const onViewFiltersChangeScopedState = createScopedState<
  ((filters: ViewFilter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
