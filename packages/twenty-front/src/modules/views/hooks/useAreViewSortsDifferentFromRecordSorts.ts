import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { areViewSortsDifferentFromRecordSortsSelector } from '@/views/states/selectors/areViewSortsDifferentFromRecordSortsFamilySelector';

export const useAreViewSortsDifferentFromRecordSorts = () => {
  const { currentView } = useGetCurrentViewOnly();

  const viewSortsAreDifferentFromRecordSorts = useRecoilComponentFamilyValueV2(
    areViewSortsDifferentFromRecordSortsSelector,
    { viewId: currentView?.id },
  );

  return { viewSortsAreDifferentFromRecordSorts };
};
