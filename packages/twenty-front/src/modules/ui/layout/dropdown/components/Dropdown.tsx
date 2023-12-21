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

import { DropdownMenu } from './DropdownMenu';
import { DropdownOnToggleEffect } from './DropdownOnToggleEffect';

type DropdownProps = {
  className?: string;
  clickableComponent?: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownPlacement?: Placement;
  dropdownMenuWidth?: number;
  dropdownOffset?: { x?: number; y?: number };
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
};

export const Dropdown = ({
  className,
  clickableComponent,
  dropdownComponents,
  dropdownMenuWidth,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownOffset = { x: 0, y: 0 },
  onClickOutside,
  onClose,
  onOpen,
}: DropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownOpen, toggleDropdown, closeDropdown, dropdownWidth } =
    useDropdown();

  const offsetMiddlewares = [];

  if (dropdownOffset.x) {
    offsetMiddlewares.push(offset({ crossAxis: dropdownOffset.x }));
  }

  if (dropdownOffset.y) {
    offsetMiddlewares.push(offset({ mainAxis: dropdownOffset.y }));
  }

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), ...offsetMiddlewares],
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
    <div ref={containerRef} className={className}>
      {clickableComponent && (
        <div
          ref={refs.setReference}
          onClick={toggleDropdown}
          className={className}
        >
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
        <DropdownMenu
          width={dropdownMenuWidth ?? dropdownWidth}
          data-select-disable
          ref={refs.setFloating}
          style={floatingStyles}
        >
          {dropdownComponents}
        </DropdownMenu>
      )}
      <DropdownOnToggleEffect
        onDropdownClose={onClose}
        onDropdownOpen={onOpen}
      />
    </div>
  );
};
