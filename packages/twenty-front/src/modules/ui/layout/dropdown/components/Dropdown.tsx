import { DropdownOnToggleEffect } from '@/ui/layout/dropdown/components/DropdownOnToggleEffect';
import { DropdownInternalContainer } from '@/ui/layout/dropdown/components/internal/DropdownInternalContainer';
import { DROPDOWN_RESIZE_MIN_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownResizeMinHeight';
import { DROPDOWN_RESIZE_MIN_WIDTH } from '@/ui/layout/dropdown/constants/DropdownResizeMinWidth';
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
  dropdownOffset?: DropdownOffset;
  dropdownStrategy?: 'fixed' | 'absolute';
  onClickOutside?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  excludedClickOutsideIds?: string[];
};

export const Dropdown = ({
  clickableComponent,
  dropdownComponents,
  hotkey,
  dropdownId,
  dropdownHotkeyScope,
  dropdownPlacement = 'bottom-end',
  dropdownStrategy = 'absolute',
  dropdownOffset,
  onClickOutside,
  onClose,
  onOpen,
  clickableComponentWidth = 'auto',
  excludedClickOutsideIds,
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

  const boundaryOptions = {
    boundary: document.querySelector('#root') ?? undefined,
    padding: {
      right: 32,
      left: 32,
      bottom: bottomAutoresizePadding,
    },
  };

  const { refs, floatingStyles, placement } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      ...offsetMiddleware,
      flip({
        ...boundaryOptions,
      }),
      size({
        apply: ({ availableHeight, availableWidth }) => {
          flushSync(() => {
            const maxHeightToApply =
              availableHeight < DROPDOWN_RESIZE_MIN_HEIGHT
                ? DROPDOWN_RESIZE_MIN_HEIGHT
                : availableHeight;

            const maxWidthToApply =
              availableWidth < DROPDOWN_RESIZE_MIN_WIDTH
                ? DROPDOWN_RESIZE_MIN_WIDTH
                : availableWidth;

            setDropdownMaxHeight(maxHeightToApply);
            setDropdownMaxWidth(maxWidthToApply);
          });
        },
        ...boundaryOptions,
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
            <DropdownInternalContainer
              floatingStyles={floatingStyles}
              dropdownComponents={dropdownComponents}
              dropdownId={dropdownId}
              dropdownPlacement={placement}
              floatingUiRefs={refs}
              hotkeyScope={dropdownHotkeyScope}
              hotkey={hotkey}
              onClickOutside={onClickOutside}
              onHotkeyTriggered={toggleDropdown}
              excludedClickOutsideIds={excludedClickOutsideIds}
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
