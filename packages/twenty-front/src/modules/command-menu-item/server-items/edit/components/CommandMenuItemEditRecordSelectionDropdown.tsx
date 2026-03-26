import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { commandMenuItemEditNumberOfSelectedRecordsState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditNumberOfSelectedRecordsState';
import { commandMenuItemEditTargetedRecordsRuleState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditTargetedRecordsRuleState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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

  const commandMenuItemEditTargetedRecordsRule = useAtomComponentStateValue(
    commandMenuItemEditTargetedRecordsRuleState,
  );
  const setCommandMenuItemEditTargetedRecordsRule = useSetAtomComponentState(
    commandMenuItemEditTargetedRecordsRuleState,
  );

  const commandMenuItemEditNumberOfSelectedRecords = useAtomComponentStateValue(
    commandMenuItemEditNumberOfSelectedRecordsState,
  );
  const setCommandMenuItemEditNumberOfSelectedRecords =
    useSetAtomComponentState(commandMenuItemEditNumberOfSelectedRecordsState);

  const [snapshot, setSnapshot] = useState({
    targetedRecordsRule: commandMenuItemEditTargetedRecordsRule,
    numberOfSelectedRecords: commandMenuItemEditNumberOfSelectedRecords,
  });

  const isNoneSelected =
    commandMenuItemEditTargetedRecordsRule.mode === 'selection' &&
    commandMenuItemEditTargetedRecordsRule.selectedRecordIds.length === 0 &&
    commandMenuItemEditNumberOfSelectedRecords === 0;

  const handleSelectNone = () => {
    setSnapshot({
      targetedRecordsRule: commandMenuItemEditTargetedRecordsRule,
      numberOfSelectedRecords: commandMenuItemEditNumberOfSelectedRecords,
    });
    setCommandMenuItemEditTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds: [],
    });
    setCommandMenuItemEditNumberOfSelectedRecords(0);
    closeDropdown(DROPDOWN_ID);
  };

  const handleSelectSelection = () => {
    setCommandMenuItemEditTargetedRecordsRule(snapshot.targetedRecordsRule);
    setCommandMenuItemEditNumberOfSelectedRecords(
      snapshot.numberOfSelectedRecords,
    );
    closeDropdown(DROPDOWN_ID);
  };

  const TriggerIcon = isNoneSelected ? IconSquareX : IconSquareCheck;
  const triggerLabel = isNoneSelected
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
                selected={isNoneSelected}
                onClick={handleSelectNone}
              />
              <MenuItemSelect
                LeftIcon={IconSquareCheck}
                text={t`Records selected`}
                selected={!isNoneSelected}
                onClick={handleSelectSelection}
              />
            </DropdownMenuItemsContainer>
          </StyledDropdownMenuContainer>
        </DropdownContent>
      }
    />
  );
};
