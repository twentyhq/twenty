import { useStore } from 'jotai';
import { type MouseEvent, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';

export type CommandMenuDropdownTriggerEvent = Pick<
  MouseEvent,
  'preventDefault' | 'clientX' | 'clientY'
>;

export const useOpenCommandMenuDropdownAtCursor = () => {
  const store = useStore();
  const { openDropdown } = useOpenDropdown();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const workspaceSurface = useWorkspaceSurface();

  const commandMenuInstanceId = useAvailableComponentInstanceId(
    CommandMenuComponentInstanceContext,
  );

  const isCommandMenuAvailable = isDefined(commandMenuInstanceId);

  const openCommandMenuDropdownAtCursor = useCallback(
    (event: CommandMenuDropdownTriggerEvent) => {
      if (!isDefined(commandMenuInstanceId)) {
        return;
      }

      event.preventDefault();

      const commandMenuDropdownId = getCommandMenuDropdownIdFromCommandMenuId(
        commandMenuInstanceId,
      );

      store.set(
        recordIndexCommandMenuDropdownPositionComponentState.atomFamily({
          instanceId: commandMenuDropdownId,
        }),
        { x: event.clientX, y: event.clientY },
      );

      if (workspaceSurface.type === 'main') {
        closeSidePanelMenu();
      }

      openDropdown({
        dropdownComponentInstanceIdFromProps: commandMenuDropdownId,
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [
      closeSidePanelMenu,
      commandMenuInstanceId,
      openDropdown,
      store,
      workspaceSurface.type,
    ],
  );

  return { isCommandMenuAvailable, openCommandMenuDropdownAtCursor };
};
