import { Keys } from 'react-hotkeys-hook';
import { Placement } from '@floating-ui/react';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

type DropdownButtonProps = {
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
}: DropdownButtonProps) => {
  return (
    <DropdownMenu
      clickableComponent={buttonComponent}
      dropdownComponents={dropdownComponents}
      dropdownId={dropdownId}
      hotkey={hotkey}
      dropdownHotkeyScope={dropdownHotkeyScope}
      dropdownPlacement={dropdownPlacement}
      onClickOutside={onClickOutside}
      onClose={onClose}
      onOpen={onOpen}
    />
  );
};
