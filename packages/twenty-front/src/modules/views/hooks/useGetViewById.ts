import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilValue } from 'recoil';

export const useGetViewById = (viewId: string | null) => {
  const view = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: viewId ?? '',
    }),
  );

  return {
    view: viewId ? view : undefined,
  };
};
