import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import {
  Dropdown,
  type DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useId } from 'react';
import { IconDotsVertical } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

type OptionsDropdownMenuProps = {
  dropdownId?: string;
  selectableListId?: string;
  selectableItemIdArray?: string[];
  clickableComponent?: ReactNode;
  dropdownPlacement?: DropdownProps['dropdownPlacement'];
  dropdownOffset?: DropdownProps['dropdownOffset'];
  shouldRegisterOptionsHotkey?: boolean;
  onOpen?: () => void;
  children: ReactNode;
};

const DEFAULT_OPTIONS_DROPDOWN_OFFSET = { y: 8 };

const OptionsDropdownMenuHotkeyEffect = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { toggleDropdown } = useToggleDropdown();

  const hotkeysConfig = {
    keys: ['ctrl+o', 'meta+o'],
    callback: () => {
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
      });
    },
    dependencies: [toggleDropdown, dropdownId],
  };

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: SIDE_PANEL_FOCUS_ID,
  });

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: dropdownId,
  });

  return null;
};

export const OptionsDropdownMenu = ({
  dropdownId: dropdownIdFromProps,
  selectableListId,
  selectableItemIdArray = [],
  clickableComponent,
  dropdownPlacement = 'top-end',
  dropdownOffset = DEFAULT_OPTIONS_DROPDOWN_OFFSET,
  shouldRegisterOptionsHotkey = true,
  onOpen,
  children,
}: OptionsDropdownMenuProps) => {
  const generatedDropdownId = useId();
  const dropdownId = dropdownIdFromProps ?? generatedDropdownId;
  const { t } = useLingui();

  const listId = selectableListId ?? dropdownId;
  const { setSelectedItemId } = useSelectableList(listId);

  const handleOpen = () => {
    if (selectableItemIdArray.length > 0) {
      setSelectedItemId(selectableItemIdArray[0]);
    }
    onOpen?.();
  };

  return (
    <>
      {shouldRegisterOptionsHotkey ? (
        <OptionsDropdownMenuHotkeyEffect dropdownId={dropdownId} />
      ) : null}
      <Dropdown
        dropdownId={dropdownId}
        data-select-disable
        clickableComponent={
          clickableComponent ?? (
            <IconButton
              Icon={IconDotsVertical}
              ariaLabel={t`Options`}
              size="small"
              variant="primary"
            />
          )
        }
        dropdownPlacement={dropdownPlacement}
        dropdownOffset={dropdownOffset}
        globalHotkeysConfig={{
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        }}
        onOpen={handleOpen}
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <SelectableList
                selectableListInstanceId={listId}
                focusId={dropdownId}
                selectableItemIdArray={selectableItemIdArray}
              >
                {children}
              </SelectableList>
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </>
  );
};
