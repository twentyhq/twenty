import { recordViewsResultComponentState } from '@/side-panel/pages/record-views/states/recordViewsResultComponentState';
import { recordViewsRetryCountComponentState } from '@/side-panel/pages/record-views/states/recordViewsRetryCountComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const useRecordViews = () => {
  const { views, loading, error, hasReadPermission } =
    useAtomComponentStateValue(recordViewsResultComponentState);
  const setRecordViewsRetryCount = useSetAtomComponentState(
    recordViewsRetryCountComponentState,
  );

  return {
    views,
    loading,
    error,
    hasReadPermission,
    retry: () =>
      setRecordViewsRetryCount(
        (recordViewsRetryCount) => recordViewsRetryCount + 1,
      ),
  };
};
