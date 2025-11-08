import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { forceRegisteredActionsByKeyState } from '@/action-menu/actions/states/forceRegisteredActionsMapComponentState';
import { PageLayoutSingleRecordActionKeys } from '@/page-layout/actions/PageLayoutSingleRecordActionKeys';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const setIsPageLayoutInEditMode = useRecoilCallback(
    ({ set }) =>
      (value: boolean) => {
        set(isPageLayoutInEditModeState, value);
        set(forceRegisteredActionsByKeyState, (prev) => ({
          ...prev,
          [PageLayoutSingleRecordActionKeys.EDIT_LAYOUT]: !value,
          [PageLayoutSingleRecordActionKeys.SAVE_LAYOUT]: value,
          [PageLayoutSingleRecordActionKeys.CANCEL_LAYOUT_EDITION]: value,
          [PageLayoutSingleRecordActionKeys.ADD_TO_FAVORITES_READ_MODE]: !value,
          [SingleRecordActionKeys.ADD_TO_FAVORITES]: value,
          [SingleRecordActionKeys.DELETE]: !value,
          [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: !value,
          [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: !value,
        }));
      },
    [isPageLayoutInEditModeState],
  );

  return { setIsPageLayoutInEditMode };
};
