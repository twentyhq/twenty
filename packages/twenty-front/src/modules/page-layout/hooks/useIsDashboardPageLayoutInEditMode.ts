import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useIsDashboardPageLayoutInEditMode = (
  pageLayoutIdFromProps?: string,
) => {
  const isDashboardInEditMode = useAtomComponentStateValue(
    isDashboardInEditModeComponentState,
    pageLayoutIdFromProps,
  );

  return isDashboardInEditMode;
};
