import { DashboardSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/types/DashboardSingleRecordActionKeys';
import { forceRegisteredActionsByKeyComponentState } from '@/action-menu/actions/states/forceRegisteredActionsMapComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetIsDashboardInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const forceRegisteredActionsByKeyState = useRecoilComponentCallbackState(
    forceRegisteredActionsByKeyComponentState,
  );

  const setIsDashboardInEditMode = useRecoilCallback(
    ({ set }) =>
      (value: boolean) => {
        set(isPageLayoutInEditModeState, value);
        set(forceRegisteredActionsByKeyState, (prev) => ({
          ...prev,
          [DashboardSingleRecordActionKeys.EDIT_DASHBOARD]: !value,
          [DashboardSingleRecordActionKeys.CANCEL_DASHBOARD_EDITION]: value,
        }));
      },
    [forceRegisteredActionsByKeyState, isPageLayoutInEditModeState],
  );

  return { setIsDashboardInEditMode };
};
