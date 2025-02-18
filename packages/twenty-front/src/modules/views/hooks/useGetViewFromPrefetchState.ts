import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilCallback } from 'recoil';

export const useGetViewFromPrefetchState = () => {
  const getViewFromPrefetchState = useRecoilCallback(
    ({ snapshot }) =>
      (viewId: string) => {
        const view = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId: viewId,
            }),
          )
          .getValue();

        return view;
      },
    [],
  );

  return {
    getViewFromPrefetchState,
  };
};
