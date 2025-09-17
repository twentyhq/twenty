import { DashboardSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/dashboard-actions/types/DashboardSingleRecordActionKeys';
import { forceRegisteredActionsMapComponentState } from '@/action-menu/actions/states/forceRegisteredActionsMapComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetDashboardEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const forceRegisteredActionsMapState = useRecoilComponentCallbackState(
    forceRegisteredActionsMapComponentState,
  );

  const setDashboardEditMode = useRecoilCallback(
    ({ set }) =>
      (value: boolean) => {
        set(isPageLayoutInEditModeState, value);
        set(
          forceRegisteredActionsMapState,
          (prev) =>
            new Map([
              ...prev,
              [DashboardSingleRecordActionKeys.EDIT_DASHBOARD, !value],
            ]),
        );
      },
    [forceRegisteredActionsMapState, isPageLayoutInEditModeState],
  );

  return { setDashboardEditMode };
};
