import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { Sort } from '@/views/components/view-bar/types/Sort';

export const onViewSortsChangeScopedState = createScopedState<
  ((sorts: Sort[]) => void | Promise<void>) | undefined
>({
  key: 'onViewSortsChangeScopedState',
  defaultValue: undefined,
});
