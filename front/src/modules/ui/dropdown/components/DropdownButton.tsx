import { useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';
import { Key } from 'ts-key-enum';

import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { useDropdownButton } from '../hooks/useDropdownButton';
import { useInternalHotkeyScopeManagement } from '../hooks/useInternalHotkeyScopeManagement';

import { DropdownToggleEffect } from './DropdownToggleEffect';

type OwnProps = {
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

export const DropdownButton = ({
  buttonComponents,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  onClickOutside,
  onClose,
  onOpen,
}: OwnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownButtonOpen, toggleDropdownButton, closeDropdownButton } =
    useDropdownButton({
      dropdownId,
    });

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), offset({ mainAxis: 8, crossAxis: 0 })],
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

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdownButton();
    },
    dropdownHotkeyScope.scope,
    [closeDropdownButton],
  );

  return (
    <div ref={containerRef}>
      {hotkey && (
        <HotkeyEffect
          hotkey={hotkey}
          onHotkeyTriggered={handleHotkeyTriggered}
        />
      )}
      {buttonComponents && (
        <div ref={refs.setReference}>{buttonComponents}</div>
      )}
      {isDropdownButtonOpen && (
        <div data-select-disable ref={refs.setFloating} style={floatingStyles}>
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
