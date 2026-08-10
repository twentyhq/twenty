import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type NavigateToRecordPageParams = {
  objectNameSingular: string;
  recordId: string;
  // Pages that carry no tab list of their own name the tab to land on.
  targetTabId?: string;
};

export const useNavigateToRecordPageFromSidePanel = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { closeDropdown } = useCloseDropdown();

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const parentViewState = useAtomComponentStateCallbackState(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const navigateToRecordPage = useCallback(
    ({
      objectNameSingular,
      recordId,
      targetTabId,
    }: NavigateToRecordPageParams) => {
      const activeTabId = store.get(
        activeTabIdComponentState.atomFamily({
          instanceId: getShowPageTabListComponentId({
            pageId: sidePanelPageInstanceId,
            targetObjectId: recordId,
          }),
        }),
      );

      const tabIdToOpen =
        targetTabId ??
        (activeTabId === 'home'
          ? objectNameSingular === CoreObjectNameSingular.Note ||
            objectNameSingular === CoreObjectNameSingular.Task
            ? 'richText'
            : 'timeline'
          : activeTabId);

      store.set(
        activeTabIdComponentState.atomFamily({
          instanceId: getShowPageTabListComponentId({
            targetObjectId: recordId,
          }),
        }),
        tabIdToOpen,
      );

      const parentView = store.get(parentViewState);

      if (
        isDefined(parentView) &&
        parentView.parentViewObjectNameSingular !== objectNameSingular
      ) {
        store.set(parentViewState, undefined);
      }

      store.set(sidePanelNavigationStackState.atom, []);

      navigate(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });

      if (isDefined(sidePanelPageInstanceId)) {
        closeDropdown(
          getSidePanelCommandMenuDropdownIdFromCommandMenuId(
            sidePanelPageInstanceId,
          ),
        );
      }

      void closeSidePanelMenu();
    },
    [
      closeDropdown,
      closeSidePanelMenu,
      navigate,
      parentViewState,
      sidePanelPageInstanceId,
      store,
    ],
  );

  return { navigateToRecordPage };
};
