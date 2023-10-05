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
  dropdownOffset,
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
    middleware: [flip(), offset({ mainAxis: 8, crossAxis: 0 })],
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
    dropdownHotkeyScope,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdown();
    },
    dropdownHotkeyScope.scope,
    [closeDropdown],
  );
  console.log(floatingStyles);
  return (
    <div ref={containerRef}>
      {clickableComponent && (
        <div ref={refs.setReference}>{clickableComponent}</div>
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
          style={
            dropdownOffset
              ? {
                  ...floatingStyles,
                  transform:
                    floatingStyles.transform +
                    `translate(${dropdownOffset.x}px, ${dropdownOffset.y}px)`,
                }
              : floatingStyles
          }
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
  );
};
