import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { ViewSort } from '@/views/types/ViewSort';

export const onViewSortsChangeScopedState = createScopedState<
  ((sorts: ViewSort[]) => void | Promise<void>) | undefined
>({
  key: 'onViewSortsChangeScopedState',
  defaultValue: undefined,
});
