import { useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  useFloating,
} from '@floating-ui/react';
import { Key } from 'ts-key-enum';

import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useDropdown } from '../hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '../hooks/useInternalHotkeyScopeManagement';

import { DropdownOnToggleEffect } from './DropdownOnToggleEffect';

type DropdownMenuProps = {
  clickableComponent?: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
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
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownOffset = { x: 0, y: 0 },
  onClickOutside,
  onClose,
  onOpen,
}: DropdownMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownOpen, toggleDropdown, closeDropdown } = useDropdown();

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      flip(),
      offset({ mainAxis: dropdownOffset.y, crossAxis: dropdownOffset.x }),
    ],
    whileElementsMounted: autoUpdate,
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
        <div data-select-disable ref={refs.setFloating} style={floatingStyles}>
          {dropdownComponents}
        </div>
      )}
      <DropdownOnToggleEffect
        onDropdownClose={onClose}
        onDropdownOpen={onOpen}
      />
    </div>
  );
};
