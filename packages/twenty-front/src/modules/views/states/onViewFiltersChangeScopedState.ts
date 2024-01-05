import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';
import { ViewFilter } from '@/views/types/ViewFilter';

export const onViewFiltersChangeScopedState = createStateScopeMap<
  ((filters: ViewFilter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
