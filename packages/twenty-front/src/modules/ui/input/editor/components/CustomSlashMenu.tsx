import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import styled from '@emotion/styled';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';

import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { SLASH_MENU_LIST_ID } from '@/ui/input/constants/SlashMenuListId';
import { CustomSlashMenuListItem } from '@/ui/input/editor/components/CustomSlashMenuListItem';
import {
  CustomSlashMenuProps,
  SuggestionItem,
} from '@/ui/input/editor/components/types';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

export type { SuggestionItem };

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

const StyledInnerContainer = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  height: 250px;
  width: 100%;
  overflow-y: auto;
`;

export const CustomSlashMenu = (props: CustomSlashMenuProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
  });

  const { setSelectedItemId } = useSelectableList(SLASH_MENU_LIST_ID);

  useEffect(() => {
    if (!isDefined(props.selectedIndex)) return;

    const selectedItem = props.items[props.selectedIndex];
    if (isDefined(selectedItem)) {
      setSelectedItemId(selectedItem.title);
    }
  }, [props.items, props.selectedIndex, setSelectedItemId]);

  return (
    <StyledContainer ref={refs.setReference}>
      {createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <OverlayContainer
            ref={refs.setFloating}
            style={floatingStyles}
            data-click-outside-id={SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          >
            <DropdownContent>
              <StyledInnerContainer>
                <DropdownMenuItemsContainer>
                  <SelectableList
                    hotkeyScope={DropdownHotkeyScope.Dropdown}
                    focusId={SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
                    selectableListInstanceId={SLASH_MENU_LIST_ID}
                    selectableItemIdArray={props.items.map(
                      (item) => item.title,
                    )}
                  >
                    {props.items.map((item) => (
                      <CustomSlashMenuListItem key={item.title} item={item} />
                    ))}
                  </SelectableList>
                </DropdownMenuItemsContainer>
              </StyledInnerContainer>
            </DropdownContent>
          </OverlayContainer>
        </motion.div>,
        document.body,
      )}
    </StyledContainer>
  );
};
