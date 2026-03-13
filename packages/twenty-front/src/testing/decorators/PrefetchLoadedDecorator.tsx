import { type Decorator } from '@storybook/react-vite';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const PrefetchLoadedDecorator: Decorator = (Story) => {
  const setPrefetchIsLoaded = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllNavigationMenuItems,
  );

  setPrefetchIsLoaded(true);

  return <Story />;
};
