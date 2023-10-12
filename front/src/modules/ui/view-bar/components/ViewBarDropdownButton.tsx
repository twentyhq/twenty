import { Keys } from 'react-hotkeys-hook';
import { Placement } from '@floating-ui/react';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownScope } from '@/ui/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

type ViewBarDropdownButtonProps = {
  buttonComponent: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  dropdownId: string;
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownPlacement?: Placement;
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
};

export const ViewBarDropdownButton = ({
  buttonComponent,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  onClickOutside,
  onClose,
  onOpen,
}: ViewBarDropdownButtonProps) => {
  return (
    <DropdownScope dropdownScopeId={dropdownId}>
      <DropdownMenu
        clickableComponent={buttonComponent}
        dropdownComponents={dropdownComponents}
        hotkey={hotkey}
        dropdownHotkeyScope={dropdownHotkeyScope}
        dropdownOffset={{ x: 0, y: 8 }}
        dropdownPlacement={dropdownPlacement}
        onClickOutside={onClickOutside}
        onClose={onClose}
        onOpen={onOpen}
      />
    </DropdownScope>
  );
};
