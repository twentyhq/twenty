import { useStore } from 'jotai';
import { type MouseEvent, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuDropdownPositionComponentState } from '@/command-menu-item/states/commandMenuDropdownPositionComponentState';
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

  const openCommandMenuDropdownAtCursor = useCallback(
    (event: CommandMenuDropdownTriggerEvent) => {
      if (!isDefined(commandMenuInstanceId)) {
        return false;
      }

      event.preventDefault();

      const commandMenuDropdownId = getCommandMenuDropdownIdFromCommandMenuId(
        commandMenuInstanceId,
      );

      store.set(
        commandMenuDropdownPositionComponentState.atomFamily({
          instanceId: commandMenuInstanceId,
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

      return true;
    },
    [
      closeSidePanelMenu,
      commandMenuInstanceId,
      openDropdown,
      store,
      workspaceSurface.type,
    ],
  );

  return { openCommandMenuDropdownAtCursor };
};
