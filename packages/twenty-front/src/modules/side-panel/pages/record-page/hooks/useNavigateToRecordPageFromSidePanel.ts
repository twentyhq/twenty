import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { getSurfaceScopedComponentInstanceId } from '@/side-panel/routing/utils/getSurfaceScopedComponentInstanceId';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
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
};

export const useNavigateToRecordPageFromSidePanel = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { closeDropdown } = useCloseDropdown();

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const contextStoreInstanceId = useContextStoreInstanceId();

  const parentViewState = useAtomComponentStateCallbackState(
    contextStoreRecordShowParentViewComponentState,
    contextStoreInstanceId,
  );

  const mainParentViewState = useAtomComponentStateCallbackState(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const navigateToRecordPage = useCallback(
    ({ objectNameSingular, recordId }: NavigateToRecordPageParams) => {
      const activeTabId = store.get(
        activeTabIdComponentState.atomFamily({
          instanceId: getShowPageTabListComponentId({
            pageId: sidePanelPageInstanceId,
            targetObjectId: recordId,
          }),
        }),
      );

      const tabIdToOpen =
        activeTabId === 'home'
          ? objectNameSingular === CoreObjectNameSingular.Note ||
            objectNameSingular === CoreObjectNameSingular.Task
            ? 'richText'
            : 'timeline'
          : activeTabId;

      store.set(
        activeTabIdComponentState.atomFamily({
          instanceId: getShowPageTabListComponentId({
            targetObjectId: recordId,
          }),
        }),
        tabIdToOpen,
      );

      // Expanding leaves this surface for the main one, so the record's related
      // lists will read the main store; a parent view about another object is
      // not this record's to inherit.
      const parentView = store.get(parentViewState);

      store.set(
        mainParentViewState,
        isDefined(parentView) &&
          parentView.parentViewObjectNameSingular === objectNameSingular
          ? parentView
          : undefined,
      );

      store.set(sidePanelNavigationStackState.atom, []);

      navigate(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });

      if (isDefined(sidePanelPageInstanceId)) {
        // The hosted record page scopes its command menu to the surface, so the
        // dropdown to close is keyed on that instance and not on the page alone.
        closeDropdown(
          getSidePanelCommandMenuDropdownIdFromCommandMenuId(
            getSurfaceScopedComponentInstanceId(
              computeRecordShowComponentInstanceId(recordId),
              sidePanelPageInstanceId,
            ),
          ),
        );
      }

      void closeSidePanelMenu();
    },
    [
      closeDropdown,
      closeSidePanelMenu,
      mainParentViewState,
      navigate,
      parentViewState,
      sidePanelPageInstanceId,
      store,
    ],
  );

  return { navigateToRecordPage };
};
