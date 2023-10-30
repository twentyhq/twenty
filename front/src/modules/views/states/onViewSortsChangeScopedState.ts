import { Sort } from '@/ui/object/sort/types/Sort';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const onViewSortsChangeScopedState = createScopedState<
  ((sorts: Sort[]) => void | Promise<void>) | undefined
>({
  key: 'onViewSortsChangeScopedState',
  defaultValue: undefined,
});
