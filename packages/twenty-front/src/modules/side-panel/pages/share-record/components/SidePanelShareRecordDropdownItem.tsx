import { type ReactNode, useId } from 'react';
import { Dropdown, type DropdownType } from 'twenty-ui/components/navigation';
import { type IconComponent } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelShareRecordDropdownItemProps = {
  itemId: string;
  label: string;
  Icon: IconComponent;
  description?: string;
  disabled?: boolean;
  type?: DropdownType;
  width?: number;
  children: ReactNode;
};

export const SidePanelShareRecordDropdownItem = ({
  itemId,
  label,
  Icon,
  description,
  disabled = false,
  type = 'menu',
  width = 200,
  children,
}: SidePanelShareRecordDropdownItemProps) => {
  const dropdownId = useId();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();

  return (
    <SelectableListItem
      itemId={itemId}
      onEnter={
        disabled
          ? undefined
          : () =>
              openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId })
      }
    >
      <DropdownRoot dropdownId={dropdownId} type={type}>
        <Dropdown.Trigger
          render={<div />}
          nativeButton={false}
          disabled={disabled}
          aria-label={
            description === undefined ? label : `${label} ${description}`
          }
        >
          <CommandMenuItem
            id={itemId}
            label={label}
            Icon={Icon}
            description={description}
            contextualTextPosition="right"
            hasSubMenu={!disabled}
            isSubMenuOpened={isDropdownOpen}
            disabled={disabled}
          />
        </Dropdown.Trigger>
        <DropdownContent align="end" width={width} aria-label={label}>
          {children}
        </DropdownContent>
      </DropdownRoot>
    </SelectableListItem>
  );
};
