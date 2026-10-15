import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { useSelectFirstRecordForEditMode } from '@/command-menu-item/edit/hooks/useSelectFirstRecordForEditMode';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSquareCheck, IconSquareX } from 'twenty-ui/icon';

const DROPDOWN_ID = 'command-menu-edit-record-selection-dropdown';

type CommandMenuItemEditRecordSelectionDropdownProps = {
  isRecordPage?: boolean;
};

export const CommandMenuItemEditRecordSelectionDropdown = ({
  isRecordPage = false,
}: CommandMenuItemEditRecordSelectionDropdownProps) => {
  const { t } = useLingui();

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
          <div data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID} />
        }
        nativeButton={false}
        disabled={isRecordPage}
      >
        <SelectControl
          selectedOption={{
            label: triggerLabel,
            value: isNoneSelected,
            Icon: TriggerIcon,
          }}
          isDisabled={isRecordPage}
          selectSizeVariant="small"
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
