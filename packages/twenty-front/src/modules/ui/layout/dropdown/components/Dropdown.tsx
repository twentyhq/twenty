import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownOnToggleEffect } from '@/ui/layout/dropdown/components/DropdownOnToggleEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { dropdownHotkeyComponentState } from '@/ui/layout/dropdown/states/dropdownHotkeyComponentState';
import { dropdownMaxHeightComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxHeightComponentState';
import { dropdownMaxWidthComponentState } from '@/ui/layout/dropdown/states/internal/dropdownMaxWidthComponentState';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import {
  Placement,
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from '@floating-ui/react';
import { MouseEvent, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Keys } from 'react-hotkeys-hook';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { useDropdown } from '../hooks/useDropdown';

type Width = `${string}px` | `${number}%` | 'auto' | number;
const StyledDropdownFallbackAnchor = styled.div`
  left: 0;
  position: fixed;
  top: 0;
`;

const StyledClickableComponent = styled.div<{
  width?: Width;
}>`
  height: fit-content;
  width: ${({ width }) => width ?? 'auto'};
`;

export type DropdownProps = {
  className?: string;
  clickableComponent?: ReactNode;
  clickableComponentWidth?: Width;
  dropdownComponents: ReactNode;
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownId: string;
  dropdownPlacement?: Placement;
  dropdownWidth?: Width;
  dropdownOffset?: DropdownOffset;
  dropdownStrategy?: 'fixed' | 'absolute';
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  avoidPortal?: boolean;
};

export const Dropdown = ({
  className,
  clickableComponent,
  dropdownComponents,
  dropdownWidth,
  hotkey,
  dropdownId,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownStrategy = 'absolute',
  dropdownOffset,
  onClickOutside,
  onClose,
  onOpen,
  avoidPortal,
  clickableComponentWidth = 'auto',
}: DropdownProps) => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(dropdownId);

  const isUsingOffset =
    isDefined(dropdownOffset?.x) || isDefined(dropdownOffset?.y);

  const offsetMiddleware = isUsingOffset
    ? [
        offset({
          crossAxis: dropdownOffset?.x ?? 0,
          mainAxis: dropdownOffset?.y ?? 0,
        }),
      ]
    : [];

  const setDropdownMaxHeight = useSetRecoilComponentStateV2(
    dropdownMaxHeightComponentState,
    dropdownId,
  );

  const setDropdownMaxWidth = useSetRecoilComponentStateV2(
    dropdownMaxWidthComponentState,
    dropdownId,
  );

  const isMobile = useIsMobile();
  const bottomAutoresizePadding = isMobile ? 64 : 32;

  const { refs, floatingStyles, placement } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      ...offsetMiddleware,
      flip(),
      size({
        padding: {
          right: 32,
          bottom: bottomAutoresizePadding,
        },
        /**
         * DO NOT TOUCH THIS apply() MIDDLEWARE PLEASE
         *  THIS IS MANDATORY FOR KEEPING AUTORESIZING FOR ALL DROPDOWNS
         *  IT'S THE STANDARD WAY OF WORKING RECOMMENDED BY THE LIBRARY
         *  See https://floating-ui.com/docs/size#usage
         */
        apply: ({ availableHeight, availableWidth }) => {
          flushSync(() => {
            setDropdownMaxHeight(availableHeight);
            setDropdownMaxWidth(availableWidth);
          });
        },
        boundary: document.querySelector('#root') ?? undefined,
      }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: dropdownStrategy,
  });

  const handleClickableComponentClick = useRecoilCallback(
    ({ set }) =>
      async (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        // TODO: refactor this when we have finished dropdown refactor with state and V1 + V2
        set(
          dropdownHotkeyComponentState({ scopeId: dropdownId }),
          dropdownHotkeyScope,
        );

        toggleDropdown(dropdownHotkeyScope);
        onClickOutside?.();
      },
    [dropdownId, dropdownHotkeyScope, onClickOutside, toggleDropdown],
  );

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <DropdownScope dropdownScopeId={dropdownId}>
        <>
          {isDefined(clickableComponent) ? (
            <StyledClickableComponent
              ref={refs.setReference}
              onClick={handleClickableComponentClick}
              aria-controls={`${dropdownId}-options`}
              aria-expanded={isDropdownOpen}
              aria-haspopup={true}
              role="button"
              width={clickableComponentWidth}
            >
              {clickableComponent}
            </StyledClickableComponent>
          ) : (
            <StyledDropdownFallbackAnchor ref={refs.setReference} />
          )}
          {isDropdownOpen && (
            <DropdownContent
              className={className}
              floatingStyles={floatingStyles}
              dropdownWidth={dropdownWidth}
              dropdownComponents={dropdownComponents}
              dropdownId={dropdownId}
              dropdownPlacement={placement}
              floatingUiRefs={refs}
              hotkeyScope={dropdownHotkeyScope}
              hotkey={hotkey}
              onClickOutside={onClickOutside}
              onHotkeyTriggered={toggleDropdown}
              avoidPortal={avoidPortal}
            />
          )}
          <DropdownOnToggleEffect
            onDropdownClose={onClose}
            onDropdownOpen={onOpen}
          />
        </>
      </DropdownScope>
    </DropdownComponentInstanceContext.Provider>
  );
};
