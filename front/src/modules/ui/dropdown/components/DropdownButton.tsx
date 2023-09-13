import { useEffect, useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { HotkeyEffect } from '../../utilities/hotkey/components/HotkeyEffect';
import { useDropdownButton } from '../hooks/useDropdownButton';
import { dropdownButtonCustomHotkeyScopeScopedFamilyState } from '../states/dropdownButtonCustomHotkeyScopeScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

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
  onDropdownToggle?: (isDropdownOpen: boolean) => void;
};

export function DropdownButton({
  buttonComponents,
  dropdownComponents,
  dropdownId,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  onDropdownToggle,
}: OwnProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownButtonOpen, toggleDropdownButton, closeDropdownButton } =
    useDropdownButton({
      dropdownId,
      onDropdownToggle,
    });

  const { refs, floatingStyles } = useFloating({
    placement: dropdownPlacement,
    middleware: [flip(), offset()],
  });

  function handleHotkeyTriggered() {
    toggleDropdownButton();
  }

  useListenClickOutside({
    refs: [containerRef],
    callback: () => {
      if (isDropdownButtonOpen) {
        closeDropdownButton();
      }
    },
  });

  const [dropdownButtonCustomHotkeyScope, setDropdownButtonCustomHotkeyScope] =
    useRecoilScopedFamilyState(
      dropdownButtonCustomHotkeyScopeScopedFamilyState,
      dropdownId,
      DropdownRecoilScopeContext,
    );

  useEffect(() => {
    if (!isDeeplyEqual(dropdownButtonCustomHotkeyScope, dropdownHotkeyScope)) {
      setDropdownButtonCustomHotkeyScope(dropdownHotkeyScope);
    }
  }, [
    dropdownHotkeyScope,
    dropdownButtonCustomHotkeyScope,
    setDropdownButtonCustomHotkeyScope,
  ]);

  return (
    <div ref={containerRef}>
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
}
