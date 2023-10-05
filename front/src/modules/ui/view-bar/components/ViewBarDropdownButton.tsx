import { Keys } from 'react-hotkeys-hook';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

type DropdownButtonProps = {
  buttonComponents?: JSX.Element | JSX.Element[];
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
  buttonComponents,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  onClickOutside,
  onClose,
  onOpen,
}: DropdownButtonProps) => {
  const { refs } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), offset({ mainAxis: 8, crossAxis: 0 })],
  });

  return (
    <div>
      {buttonComponents && (
        <div ref={refs.setReference}>{buttonComponents}</div>
      )}
      <DropdownMenu
        dropdownComponents={dropdownComponents}
        dropdownId={dropdownId}
        hotkey={hotkey}
        dropdownHotkeyScope={dropdownHotkeyScope}
        dropdownPlacement={dropdownPlacement}
        onClickOutside={onClickOutside}
        onClose={onClose}
        onOpen={onOpen}
      />
    </div>
  );
};
