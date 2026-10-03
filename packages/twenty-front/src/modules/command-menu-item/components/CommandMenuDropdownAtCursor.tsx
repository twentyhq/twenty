import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type CommandMenuDropdownAtCursorProps = {
  children: ReactNode;
};

export const CommandMenuDropdownAtCursor = ({
  children,
}: CommandMenuDropdownAtCursorProps) => {
  const { t } = useLingui();

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId = getCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const recordIndexCommandMenuDropdownPosition = useAtomComponentStateValue(
    recordIndexCommandMenuDropdownPositionComponentState,
    dropdownId,
  );

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <DropdownContent
        anchor={createVirtualElementFromPosition(
          recordIndexCommandMenuDropdownPosition,
        )}
        aria-label={t`Actions`}
      >
        <Dropdown.Section
          data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
        >
          {children}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
