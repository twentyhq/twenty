import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { useSelectFirstRecordForEditMode } from '@/command-menu-item/edit/hooks/useSelectFirstRecordForEditMode';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown, IconSquareCheck, IconSquareX } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

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

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type CommandMenuItemEditRecordSelectionDropdownProps = {
  isRecordPage?: boolean;
};

export const CommandMenuItemEditRecordSelectionDropdown = ({
  isRecordPage = false,
}: CommandMenuItemEditRecordSelectionDropdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const mainContextStoreHasSelectedRecords = useAtomStateValue(
    mainContextStoreHasSelectedRecordsSelector,
  );

  const { selectFirstRecordForEditMode } = useSelectFirstRecordForEditMode();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isNoneSelected = !mainContextStoreHasSelectedRecords;

  const handleSelectRecords = () => {
    if (isNoneSelected) {
      selectFirstRecordForEditMode();
    }
  };

  const TriggerIcon = isNoneSelected ? IconSquareX : IconSquareCheck;
  const triggerLabel = isNoneSelected
    ? t`No record selected`
    : t`Records selected`;

  return (
    <DropdownRoot dropdownId={DROPDOWN_ID} type="picker">
      <Dropdown.Trigger
        render={
          <StyledClickableArea
            data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          />
        }
        nativeButton={false}
        disabled={isRecordPage}
      >
        <TriggerIcon
          size={16}
          color={theme.font.color.primary}
          stroke={theme.icon.stroke.sm}
        />
        <StyledLabel>{triggerLabel}</StyledLabel>
        <IconChevronDown
          size={16}
          color={theme.font.color.primary}
          stroke={theme.icon.stroke.sm}
        />
      </Dropdown.Trigger>
      <DropdownContent sideOffset={4} aria-label={t`Record selection`}>
        <Dropdown.Section
          data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
        >
          <Dropdown.OptionItem
            selected={isNoneSelected}
            onSelect={resetRecordIndexSelection}
            startIcon={<SelectOptionIcon Icon={IconSquareX} />}
          >
            {t`No record selected`}
          </Dropdown.OptionItem>
          <Dropdown.OptionItem
            selected={!isNoneSelected}
            onSelect={handleSelectRecords}
            startIcon={<SelectOptionIcon Icon={IconSquareCheck} />}
          >
            {t`Records selected`}
          </Dropdown.OptionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
