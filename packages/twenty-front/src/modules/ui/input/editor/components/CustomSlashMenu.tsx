import { useBlockNoteEditor } from '@blocknote/react';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { SLASH_MENU_LIST_ID } from '@/ui/input/constants/SlashMenuListId';
import { CustomSlashMenuListItem } from '@/ui/input/editor/components/CustomSlashMenuListItem';
import type {
  CustomSlashMenuProps,
  SuggestionItem,
} from '@/ui/input/editor/components/types';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isDefined } from 'twenty-shared/utils';

export type { SuggestionItem };

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

export const CustomSlashMenu = ({
  items,
  selectedIndex,
}: CustomSlashMenuProps) => {
  const editor = useBlockNoteEditor();

  const currentBlock = editor?.getTextCursorPosition()?.block;
  const blockType = currentBlock?.type;
  const headingLevel =
    blockType === 'heading' ? (currentBlock?.props?.level as number) : null;

  const getOffsetValue = (placement: string) => {
    if (!placement.startsWith('top')) return 0;

    switch (headingLevel) {
      case 1:
        return 65;
      case 2:
        return 50;
      case 3:
        return 45;
      default:
        return 40;
    }
  };

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [flip(), offset(({ placement }) => getOffsetValue(placement))],
  });

  const { setSelectedItemId } = useSelectableList(SLASH_MENU_LIST_ID);

  useEffect(() => {
    if (!isDefined(selectedIndex)) return;

    const selectedItem = items[selectedIndex];

    if (isDefined(selectedItem)) {
      setSelectedItemId(selectedItem.title);
    }
  }, [items, selectedIndex, setSelectedItemId]);

  return (
    <StyledContainer ref={refs.setReference}>
      <>
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
                <DropdownMenuItemsContainer hasMaxHeight>
                  <SelectableList
                    focusId={SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
                    selectableListInstanceId={SLASH_MENU_LIST_ID}
                    selectableItemIdArray={items.map((item) => item.title)}
                  >
                    {items.map((item) => (
                      <CustomSlashMenuListItem key={item.title} item={item} />
                    ))}
                  </SelectableList>
                </DropdownMenuItemsContainer>
              </DropdownContent>
            </OverlayContainer>
          </motion.div>,
          document.body,
        )}
      </>
    </StyledContainer>
  );
};
