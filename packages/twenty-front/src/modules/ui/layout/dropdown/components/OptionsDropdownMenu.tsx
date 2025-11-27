import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useId } from 'react';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

type OptionsDropdownMenuProps = {
  dropdownId?: string;
  selectableListId?: string;
  selectableItemIdArray?: string[];
  onOpen?: () => void;
  children: ReactNode;
};

export const OptionsDropdownMenu = ({
  dropdownId: dropdownIdFromProps,
  selectableListId,
  selectableItemIdArray = [],
  onOpen,
  children,
}: OptionsDropdownMenuProps) => {
  const generatedDropdownId = useId();
  const dropdownId = dropdownIdFromProps ?? generatedDropdownId;
  const { t } = useLingui();
  const theme = useTheme();
  const { toggleDropdown } = useToggleDropdown();

  const listId = selectableListId ?? dropdownId;
  const { setSelectedItemId } = useSelectableList(listId);

  const handleOpen = () => {
    if (selectableItemIdArray.length > 0) {
      setSelectedItemId(selectableItemIdArray[0]);
    }
    onOpen?.();
  };

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

  return (
    <Dropdown
      dropdownId={dropdownId}
      data-select-disable
      clickableComponent={
        <Button
          title={t`Options`}
          hotkeys={[getOsControlSymbol(), 'O']}
          size="small"
        />
      }
      dropdownPlacement="top-end"
      dropdownOffset={{ y: parseInt(theme.spacing(2), 10) }}
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
  );
};
