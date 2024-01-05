import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';
import { ViewSort } from '@/views/types/ViewSort';

export const onViewSortsChangeScopedState = createStateScopeMap<
  ((sorts: ViewSort[]) => void | Promise<void>) | undefined
>({
  key: 'onViewSortsChangeScopedState',
  defaultValue: undefined,
});
