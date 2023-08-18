import { useEffect, useRef } from 'react';
import { Keys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { flip, offset, Placement, useFloating } from '@floating-ui/react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useDropdownButton } from '../hooks/useDropdownButton';
import { dropdownButtonCustomHotkeyScopeScopedState } from '../states/dropdownButtonCustomHotkeyScopeScopedState';

import { HotkeyEffect } from './HotkeyEffect';

const StyledContainer = styled.div`
  position: relative;
  z-index: 100;
`;

type OwnProps = {
  buttonComponents: JSX.Element | JSX.Element[];
  dropdownComponents: JSX.Element | JSX.Element[];
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope?: HotkeyScope;
  dropdownPlacement?: Placement;
};

export function DropdownButton({
  buttonComponents,
  dropdownComponents,
  hotkey,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
}: OwnProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDropdownButtonOpen, toggleDropdownButton, closeDropdownButton } =
    useDropdownButton();

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
    useRecoilScopedState(dropdownButtonCustomHotkeyScopeScopedState);

  useEffect(() => {
    if (!isDeeplyEqual(dropdownButtonCustomHotkeyScope, dropdownHotkeyScope)) {
      setDropdownButtonCustomHotkeyScope(dropdownHotkeyScope);
    }
  }, [
    setDropdownButtonCustomHotkeyScope,
    dropdownHotkeyScope,
    dropdownButtonCustomHotkeyScope,
  ]);

  return (
    <StyledContainer ref={containerRef}>
      {hotkey && (
        <HotkeyEffect
          hotkey={hotkey}
          onHotkeyTriggered={handleHotkeyTriggered}
        />
      )}
      <div ref={refs.setReference}>
        <>{buttonComponents}</>
      </div>
      {isDropdownButtonOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          <>{dropdownComponents}</>
        </div>
      )}
    </StyledContainer>
  );
}
