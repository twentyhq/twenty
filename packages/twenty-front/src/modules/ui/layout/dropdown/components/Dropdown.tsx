import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  size,
  useFloating,
} from '@floating-ui/react';
import { MouseEvent, ReactNode } from 'react';
import { Keys } from 'react-hotkeys-hook';

import { useDropdown } from '../hooks/useDropdown';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownUnmountEffect } from '@/ui/layout/dropdown/components/DropdownUnmountEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponeInstanceContext';
import { dropdownHotkeyComponentState } from '@/ui/layout/dropdown/states/dropdownHotkeyComponentState';
import { dropdownMaxHeightComponentStateV2 } from '@/ui/layout/dropdown/states/dropdownMaxHeightComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { flushSync } from 'react-dom';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';
import { sleep } from '~/utils/sleep';
import { DropdownOnToggleEffect } from './DropdownOnToggleEffect';

const StyledDropdownFallbackAnchor = styled.div`
  left: 0;
  position: absolute;
  top: 0;
`;

type DropdownProps = {
  className?: string;
  clickableComponent?: ReactNode;
  dropdownComponents: ReactNode;
  hotkey?: {
    key: Keys;
    scope: string;
  };
  dropdownHotkeyScope: HotkeyScope;
  dropdownId: string;
  dropdownPlacement?: Placement;
  dropdownMenuWidth?: `${string}px` | `${number}%` | 'auto' | number;
  dropdownOffset?: { x?: number; y?: number };
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
  dropdownMenuWidth,
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
}: DropdownProps) => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(dropdownId);

  const setDropdownMaxHeight = useSetRecoilComponentStateV2(
    dropdownMaxHeightComponentStateV2,
    dropdownId,
  );

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

  const { refs, floatingStyles, placement } = useFloating({
    placement: dropdownPlacement,
    middleware: [
      ...offsetMiddleware,
      flip(),
      size({
        padding: 32,
        apply: ({ availableHeight }) => {
          flushSync(() => {
            setDropdownMaxHeight(availableHeight);
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

        await sleep(100);

        toggleDropdown();
        onClickOutside?.();
      },
    [dropdownId, dropdownHotkeyScope, onClickOutside, toggleDropdown],
  );

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <DropdownScope dropdownScopeId={getScopeIdFromComponentId(dropdownId)}>
        <>
          {isDefined(clickableComponent) ? (
            <div
              ref={refs.setReference}
              onClick={handleClickableComponentClick}
            >
              {clickableComponent}
            </div>
          ) : (
            <StyledDropdownFallbackAnchor ref={refs.setReference} />
          )}
          {isDropdownOpen && (
            <DropdownContent
              className={className}
              floatingStyles={floatingStyles}
              dropdownMenuWidth={dropdownMenuWidth}
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
      <DropdownUnmountEffect dropdownId={dropdownId} />
    </DropdownComponentInstanceContext.Provider>
  );
};
