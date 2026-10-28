import { StyledOverlayPortalLayer } from '@/ui/layout/overlay/components/StyledOverlayPortalLayer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { dropdownMaxHeightComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxHeightComponentState';
import { dropdownMaxWidthComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxWidthComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { HotkeyEffect } from '@/ui/utilities/hotkey/components/HotkeyEffect';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import {
  FloatingPortal,
  type Placement,
  type UseFloatingReturn,
} from '@floating-ui/react';
import { useContext, useEffect } from 'react';
import { type Keys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledDropdownOverlayContainer = styled(OverlayContainer)`
  animation: dropdown-overlay-enter
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
  border-radius: ${themeCssVariables.border.radius.lg};

  @keyframes dropdown-overlay-enter {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes dropdown-overlay-fade-in {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-name: dropdown-overlay-fade-in;
  }
`;

const StyledDropdownInsideContainer = styled.div`
  display: flex;

  flex-direction: column;
  height: 100%;
  width: 100%;
`;

type DropdownInternalContainerProps = {
  dropdownId: string;
  dropdownPlacement: Placement;
  floatingUiRefs: UseFloatingReturn['refs'];
  onClickOutside?: () => void;
  floatingStyles: UseFloatingReturn['floatingStyles'];
  hotkey?: {
    key: Keys;
  };
  onHotkeyTriggered?: () => void;
  dropdownComponents: React.ReactNode;
  parentDropdownId?: string;
  excludedClickOutsideIds?: string[];
  isDropdownInModal?: boolean;
};

export const DropdownInternalContainer = ({
  dropdownId,
  dropdownPlacement,
  floatingUiRefs,
  onClickOutside,
  floatingStyles,
  hotkey,
  onHotkeyTriggered,
  dropdownComponents,
  excludedClickOutsideIds,
  isDropdownInModal = false,
}: DropdownInternalContainerProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  const { closeDropdown } = useCloseDropdown();

  const activeDropdownFocusId = useAtomStateValue(activeDropdownFocusIdState);

  const dropdownMaxHeight = useAtomComponentStateValue(
    dropdownMaxHeightComponentState,
    dropdownId,
  );

  const dropdownMaxWidth = useAtomComponentStateValue(
    dropdownMaxWidthComponentState,
    dropdownId,
  );

  const setDropdownPlacement = useSetAtomComponentState(
    dropdownPlacementComponentState,
    dropdownId,
  );

  // TODO: remove this useEffect
  useEffect(() => {
    setDropdownPlacement(dropdownPlacement);
  }, [dropdownPlacement, setDropdownPlacement]);

  useListenClickOutside({
    refs: [floatingUiRefs.floating, floatingUiRefs.domReference],
    listenerId: dropdownId,
    callback: (event) => {
      if (activeDropdownFocusId !== dropdownId) return;

      if (isDropdownOpen) {
        event.stopImmediatePropagation();
        event.preventDefault();

        closeDropdown(dropdownId);
      }

      onClickOutside?.();
    },
    excludedClickOutsideIds,
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (activeDropdownFocusId !== dropdownId) return;

      if (isDropdownOpen) {
        closeDropdown(dropdownId);
      }
    },
    focusId: dropdownId,
    dependencies: [
      closeDropdown,
      isDropdownOpen,
      activeDropdownFocusId,
      dropdownId,
    ],
  });

  const dropdownMenuStyles = {
    ...floatingStyles,
    maxHeight: dropdownMaxHeight,
    maxWidth: dropdownMaxWidth,
  };

  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  return (
    <>
      {hotkey && onHotkeyTriggered && (
        <HotkeyEffect
          hotkey={hotkey}
          onHotkeyTriggered={onHotkeyTriggered}
          focusId={dropdownId}
        />
      )}

      <FloatingPortal>
        <StyledOverlayPortalLayer
          data-floating-ui-viewport
          ref={floatingUiRefs.setFloating}
          style={dropdownMenuStyles}
          role="listbox"
          id={`${dropdownId}-options`}
          data-click-outside-id={excludedClickOutsideId}
          isAboveModal={isDropdownInModal}
        >
          <StyledDropdownOverlayContainer>
            <StyledDropdownInsideContainer
              id={dropdownId}
              data-select-disable
              data-click-outside-id={parentClickOutsideId}
            >
              {dropdownComponents}
            </StyledDropdownInsideContainer>
          </StyledDropdownOverlayContainer>
        </StyledOverlayPortalLayer>
      </FloatingPortal>
    </>
  );
};
