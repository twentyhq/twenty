import { useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';

import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useDropdownButton } from '../hooks/useDropdownButton';
import { useInternalHotkeyScopeManagement } from '../hooks/useInternalHotkeyScopeManagement';

type OwnProps = {
  buttonComponents: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  dropdownId: string;
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope?: HotkeyScope;
  dropdownPlacement?: Placement;
  onClickOutside?: () => void;
  onClose?: () => void;
};

export const DropdownButton = ({
  buttonComponents,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  onClickOutside,
  onClose,
}: OwnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownButtonOpen, toggleDropdownButton, closeDropdownButton } =
    useDropdownButton({
      dropdownId,
    });

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), offset()],
  });

  const handleHotkeyTriggered = () => {
    toggleDropdownButton();
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: () => {
      onClickOutside?.();

      if (isDropdownButtonOpen) {
        closeDropdownButton();
      }
    },
  });

  useInternalHotkeyScopeManagement({
    dropdownId,
    dropdownHotkeyScope,
  });

  return (
    <div ref={containerRef}>
      {dropdownHotkeyScope?.scope && onClose ? (
        <HotkeyEffect
          hotkey={{
            key: 'esc',
            scope: dropdownHotkeyScope?.scope,
          }}
          onHotkeyTriggered={onClose}
        />
      ) : null}
      {hotkey && (
        <HotkeyEffect
          hotkey={hotkey}
          onHotkeyTriggered={handleHotkeyTriggered}
        />
      )}
      <div ref={refs.setReference}>{buttonComponents}</div>
      {isDropdownButtonOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          {dropdownComponents}
        </div>
      )}
    </div>
  );
};
