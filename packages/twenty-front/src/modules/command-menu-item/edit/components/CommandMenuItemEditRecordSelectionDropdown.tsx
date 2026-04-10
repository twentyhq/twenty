import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { useSelectFirstRecordForEditMode } from '@/command-menu-item/edit/hooks/useSelectFirstRecordForEditMode';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

const StyledClickableArea = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
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

type CommandMenuItemEditRecordSelectionDropdownProps = {
  isRecordPage?: boolean;
};

export const CommandMenuItemEditRecordSelectionDropdown = ({
  isRecordPage = false,
}: CommandMenuItemEditRecordSelectionDropdownProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const mainContextStoreHasSelectedRecords = useAtomStateValue(
    mainContextStoreHasSelectedRecordsSelector,
  );

  const { selectFirstRecordForEditMode } = useSelectFirstRecordForEditMode();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isNoneSelected = !mainContextStoreHasSelectedRecords;

  const handleSelectMode = (mode: 'none' | 'selection') => {
    if (mode === 'selection' && isNoneSelected) {
      selectFirstRecordForEditMode();
    } else if (mode === 'none') {
      resetRecordIndexSelection();
    }

    closeDropdown(DROPDOWN_ID);
  };

  const TriggerIcon = isNoneSelected ? IconSquareX : IconSquareCheck;
  const triggerLabel = isNoneSelected
    ? t`No record selected`
    : t`Records selected`;

  return (
    <Dropdown
      dropdownId={DROPDOWN_ID}
      disableClickForClickableComponent={isRecordPage}
      clickableComponent={
        <StyledClickableArea
          disabled={isRecordPage}
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
                onClick={() => handleSelectMode('none')}
              />
              <MenuItemSelect
                LeftIcon={IconSquareCheck}
                text={t`Records selected`}
                selected={!isNoneSelected}
                onClick={() => handleSelectMode('selection')}
              />
            </DropdownMenuItemsContainer>
          </StyledDropdownMenuContainer>
        </DropdownContent>
      }
    />
  );
};
