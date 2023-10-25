import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { availableSortsScopedState } from '@/views/states/availableViewSortsScopedState';

export const useSortStates = ({ scopeId }: { scopeId: string }) => {
  const [availableSorts, setAvailableSorts] = useRecoilScopedStateV2(
    availableSortsScopedState,
    scopeId,
  );

  if (!availableSorts) {
    throw new Error('availableSorts is undefined');
  }

  return {
    availableSorts,
    setAvailableSorts,
  };
};
