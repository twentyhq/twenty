import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const isScrolledLeftSelector = createComponentReadOnlySelector({
  key: 'isScrolledLeftSelector',
  get:
    () =>
    ({ get }) => {
      return get(scrollLeftState) > 0;
    },
});
