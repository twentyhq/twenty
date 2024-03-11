import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';

export const onViewFiltersChangeScopedState = createComponentState<
  ((filters: ViewFilter[]) => void | Promise<void>) | undefined
>({
  key: 'onViewFiltersChangeScopedState',
  defaultValue: undefined,
});
