import { scrollTopState } from '@/ui/utilities/scroll/states/scrollTopState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const isScrolledTopSelector = createComponentReadOnlySelector({
  key: 'isScrolledTopSelector',
  get:
    () =>
    ({ get }) => {
      return get(scrollTopState) > 0;
    },
});
