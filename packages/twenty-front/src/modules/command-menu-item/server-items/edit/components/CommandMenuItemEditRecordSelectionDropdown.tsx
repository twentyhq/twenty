import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import {
  commandMenuItemEditRecordSelectionPreviewModeState,
  type CommandMenuItemEditRecordSelectionPreviewMode,
} from '@/command-menu-item/server-items/edit/states/commandMenuItemEditRecordSelectionPreviewModeState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  IconChevronDown,
  IconSquareCheck,
  IconSquareX,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DROPDOWN_ID = 'command-menu-edit-record-selection-dropdown';

const StyledClickableArea = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDropdownMenuContainer = styled.div`
  width: 100%;
`;

export const CommandMenuItemEditRecordSelectionDropdown = () => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const commandMenuItemEditRecordSelectionPreviewMode =
    useAtomComponentStateValue(
      commandMenuItemEditRecordSelectionPreviewModeState,
    );
  const setCommandMenuItemEditRecordSelectionPreviewMode =
    useSetAtomComponentState(
      commandMenuItemEditRecordSelectionPreviewModeState,
    );

  const handleSelectPreviewMode = (
    mode: CommandMenuItemEditRecordSelectionPreviewMode,
  ) => {
    setCommandMenuItemEditRecordSelectionPreviewMode(mode);
    closeDropdown(DROPDOWN_ID);
  };

  const TriggerIcon =
    commandMenuItemEditRecordSelectionPreviewMode === 'none'
      ? IconSquareX
      : IconSquareCheck;
  const triggerLabel =
    commandMenuItemEditRecordSelectionPreviewMode === 'none'
      ? t`No record selected`
      : t`Records selected`;

  return (
    <Dropdown
      dropdownId={DROPDOWN_ID}
      clickableComponent={
        <StyledClickableArea
          data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
        >
          <TriggerIcon size={16} />
          <StyledLabel>{triggerLabel}</StyledLabel>
          <IconChevronDown size={16} />
        </StyledClickableArea>
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <StyledDropdownMenuContainer
            data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          >
            <DropdownMenuItemsContainer>
              <MenuItemSelect
                LeftIcon={IconSquareX}
                text={t`No record selected`}
                selected={
                  commandMenuItemEditRecordSelectionPreviewMode === 'none'
                }
                onClick={() => handleSelectPreviewMode('none')}
              />
              <MenuItemSelect
                LeftIcon={IconSquareCheck}
                text={t`Records selected`}
                selected={
                  commandMenuItemEditRecordSelectionPreviewMode === 'selection'
                }
                onClick={() => handleSelectPreviewMode('selection')}
              />
            </DropdownMenuItemsContainer>
          </StyledDropdownMenuContainer>
        </DropdownContent>
      }
    />
  );
};
