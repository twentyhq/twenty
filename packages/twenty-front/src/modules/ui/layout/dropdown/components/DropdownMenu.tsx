import { DropdownOnToggleEffect } from '@/ui/layout/dropdown/components/DropdownOnToggleEffect';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { type DropdownMenuProps } from '@/ui/layout/dropdown/types/DropdownMenuProps';
import { getDropdownMenuPlacement } from '@/ui/layout/dropdown/utils/getDropdownMenuPlacement';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Menu } from 'twenty-ui/primitives/surfaces';

const StyledPopup = styled(Menu.Popup)`
  inline-size: auto;
`;

const StyledAnchor = styled.div`
  left: 0;
  position: fixed;
  top: 0;
`;

export const DropdownMenu = ({
  dropdownId,
  clickableComponent,
  dropdownComponents,
  dropdownPlacement = 'bottom-end',
  dropdownOffset,
  positionReference,
  globalHotkeysConfig,
  finalFocus,
  onOpen,
  onClose,
  nativeButton = true,
  openOnClick = false,
}: DropdownMenuProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const fallbackAnchorRef = useRef<HTMLDivElement>(null);
  const { side, align } = getDropdownMenuPlacement(dropdownPlacement);
  const triggerId = `${dropdownId}-trigger`;
  const isUsingFallbackAnchor =
    !isDefined(clickableComponent) && !isDefined(positionReference);
  const alignOffset = (dropdownOffset?.x ?? 0) * (align === 'end' ? -1 : 1);

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: dropdownId }}
    >
      <Menu.Root
        open={isDropdownOpen}
        triggerId={triggerId}
        modal={false}
        onOpenChange={(open) => {
          if (open === isDropdownOpen) {
            return;
          }
          if (open) {
            openDropdown({
              dropdownComponentInstanceIdFromProps: dropdownId,
              globalHotkeysConfig,
            });
            return;
          }
          closeDropdown(dropdownId);
        }}
      >
        {isDefined(clickableComponent) ? (
          <Menu.Trigger
            id={triggerId}
            render={clickableComponent}
            nativeButton={nativeButton}
            onMouseDown={
              openOnClick ? (event) => event.preventBaseUIHandler() : undefined
            }
            onClick={(event) => {
              event.stopPropagation();
              if (!openOnClick) {
                return;
              }
              event.preventBaseUIHandler();
              if (isDropdownOpen) {
                closeDropdown(dropdownId);
                return;
              }
              openDropdown({
                dropdownComponentInstanceIdFromProps: dropdownId,
                globalHotkeysConfig,
              });
            }}
          />
        ) : (
          <StyledAnchor
            ref={fallbackAnchorRef}
            style={{
              left: dropdownOffset?.x ?? 0,
              top: dropdownOffset?.y ?? 0,
            }}
          />
        )}
        <StyledPopup
          id={`${dropdownId}-options`}
          finalFocus={finalFocus}
          onClick={(event) => event.stopPropagation()}
          side={side}
          align={align}
          sideOffset={isUsingFallbackAnchor ? 0 : (dropdownOffset?.y ?? 0)}
          alignOffset={isUsingFallbackAnchor ? 0 : alignOffset}
          anchor={
            positionReference ??
            (isDefined(clickableComponent) ? undefined : fallbackAnchorRef)
          }
          data-click-outside-id={excludedClickOutsideId}
        >
          <div
            id={dropdownId}
            data-select-disable
            data-click-outside-id={parentClickOutsideId}
          >
            {dropdownComponents}
          </div>
        </StyledPopup>
        <DropdownOnToggleEffect
          onDropdownOpen={onOpen}
          onDropdownClose={onClose}
        />
      </Menu.Root>
    </DropdownComponentInstanceContext.Provider>
  );
};
