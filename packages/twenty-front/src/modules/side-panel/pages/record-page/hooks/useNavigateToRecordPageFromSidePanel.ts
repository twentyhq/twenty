import { useStore } from 'jotai';
import { useCallback } from 'react';
import { createPath, useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { type NavigateAppOptions } from '~/hooks/useNavigateApp';

type NavigateToRecordPageParams = {
  objectNameSingular: string;
  recordId: string;
};

export const useNavigateToRecordPageFromSidePanel = () => {
  const store = useStore();
  const navigate = useNavigate();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { closeDropdown } = useCloseDropdown();
  const workspaceSurface = useWorkspaceSurface();

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const navigateToRecordPage = useCallback(
    ({ objectNameSingular, recordId }: NavigateToRecordPageParams) => {
      const navigationStack = store.get(sidePanelNavigationStackState.atom);
      const currentRoutedLocation = navigationStack.at(-1)?.routedLocation;
      const currentRoutedPath = isDefined(currentRoutedLocation)
        ? createPath(currentRoutedLocation)
        : undefined;
      const currentRecordShowParams = isDefined(currentRoutedPath)
        ? getRecordShowParamsFromPath(currentRoutedPath)
        : null;

      const isExpandingCurrentRoutedRecord =
        currentRecordShowParams?.objectRecordId === recordId &&
        currentRecordShowParams.objectNameSingular === objectNameSingular;

      const fallbackTabId =
        objectNameSingular === CoreObjectNameSingular.Note ||
        objectNameSingular === CoreObjectNameSingular.Task
          ? 'richText'
          : 'timeline';
      const destinationPath =
        isExpandingCurrentRoutedRecord && isDefined(currentRoutedPath)
          ? currentRoutedPath
          : `${getAppPath(AppPath.RecordShowPage, {
              objectNameSingular,
              objectRecordId: recordId,
            })}#${encodeURIComponent(fallbackTabId)}`;

      const panelParentViewState = isDefined(sidePanelPageInstanceId)
        ? contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: sidePanelPageInstanceId,
          })
        : undefined;
      const parentView = isDefined(panelParentViewState)
        ? store.get(panelParentViewState)
        : undefined;

      store.set(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        isDefined(parentView) &&
          parentView.parentViewObjectNameSingular === objectNameSingular
          ? parentView
          : undefined,
      );

      store.set(sidePanelNavigationStackState.atom, []);

      navigate(destinationPath, { surface: 'main' } as NavigateAppOptions);

      if (isDefined(sidePanelPageInstanceId)) {
        const baseCommandMenuInstanceId =
          computeRecordShowComponentInstanceId(recordId);
        const commandMenuInstanceId =
          workspaceSurface.type === 'side-panel'
            ? `${baseCommandMenuInstanceId}-${workspaceSurface.instanceId}`
            : baseCommandMenuInstanceId;

        closeDropdown(
          getSidePanelCommandMenuDropdownIdFromCommandMenuId(
            commandMenuInstanceId,
          ),
        );
      }

      void closeSidePanelMenu();
    },
    [
      closeDropdown,
      closeSidePanelMenu,
      navigate,
      sidePanelPageInstanceId,
      store,
      workspaceSurface.instanceId,
      workspaceSurface.type,
    ],
  );

  return { navigateToRecordPage };
};
