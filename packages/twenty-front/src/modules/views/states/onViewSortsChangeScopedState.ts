import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewSort } from '@/views/types/ViewSort';

export const onViewSortsChangeScopedState = createComponentState<
  ((sorts: ViewSort[]) => void | Promise<void>) | undefined
>({
  key: 'onViewSortsChangeScopedState',
  defaultValue: undefined,
});
