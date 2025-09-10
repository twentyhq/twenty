import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilCallback } from 'recoil';

export const useGetViewFromPrefetchState = () => {
  const getViewFromPrefetchState = useRecoilCallback(
    ({ snapshot }) =>
      (viewId: string) => {
        const view = snapshot
          .getLoadable(
            coreViewFromViewIdFamilySelector({
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
