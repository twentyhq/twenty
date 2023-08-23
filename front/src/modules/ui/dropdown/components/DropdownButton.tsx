import { Keys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useDropdownButton } from '../hooks/useDropdownButton';

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
  dropdownScopeToSet?: HotkeyScope;
};

export function DropdownButton({
  buttonComponents,
  dropdownComponents,
  hotkey,
  dropdownScopeToSet,
}: OwnProps) {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton();

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    middleware: [flip(), offset()],
  });

  function handleButtonClick() {
    if (dropdownScopeToSet) {
      toggleDropdownButton(dropdownScopeToSet);
    } else {
      toggleDropdownButton();
    }
  }

  return (
    <StyledContainer>
      {hotkey && (
        <HotkeyEffect hotkey={hotkey} onHotkeyTriggered={handleButtonClick} />
      )}
      <div ref={refs.setReference} onClick={handleButtonClick}>
        {buttonComponents}
      </div>
      {isDropdownButtonOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          <>{dropdownComponents}</>
        </div>
      )}
    </StyledContainer>
  );
}
