import { useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';
import { Key } from 'ts-key-enum';

import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useDropdown } from '../hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '../hooks/useInternalHotkeyScopeManagement';
import { DropdownScope } from '../scopes/DropdownScope';

import { DropdownToggleEffect } from './DropdownToggleEffect';

type DropdownMenuProps = {
  clickableComponent?: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  dropdownId: string;
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownPlacement?: Placement;
  dropdownOffset?: { x: number; y: number };
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
};

export const DropdownMenu = ({
  clickableComponent,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownOffset = { x: 0, y: 0 },
  onClickOutside,
  onClose,
  onOpen,
}: DropdownMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownOpen, toggleDropdown, closeDropdown } = useDropdown({
    dropdownId,
  });

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      flip(),
      offset({ mainAxis: dropdownOffset.y, crossAxis: dropdownOffset.x }),
    ],
  });

  const handleHotkeyTriggered = () => {
    toggleDropdown();
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: () => {
      onClickOutside?.();

      if (isDropdownOpen) {
        closeDropdown();
      }
    },
  });

  useInternalHotkeyScopeManagement({
    dropdownId,
    dropdownHotkeyScopeFromParent: dropdownHotkeyScope,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdown();
    },
    dropdownHotkeyScope.scope,
    [closeDropdown],
  );

  return (
    <DropdownScope dropdownScopeId={dropdownId}>
      <div ref={containerRef}>
        {clickableComponent && (
          <div ref={refs.setReference} onClick={toggleDropdown}>
            {clickableComponent}
          </div>
        )}
        {hotkey && (
          <HotkeyEffect
            hotkey={hotkey}
            onHotkeyTriggered={handleHotkeyTriggered}
          />
        )}
        {isDropdownOpen && (
          <div
            data-select-disable
            ref={refs.setFloating}
            style={floatingStyles}
          >
            {dropdownComponents}
          </div>
        )}
        <DropdownToggleEffect
          dropdownId={dropdownId}
          onDropdownClose={onClose}
          onDropdownOpen={onOpen}
        />
      </div>
    </DropdownScope>
  );
};
