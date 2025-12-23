import styled from '@emotion/styled';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/MentionMenuDropdownClickOutsideId';
import { MENTION_MENU_LIST_ID } from '@/ui/input/constants/MentionMenuListId';
import { CustomMentionMenuListItem } from '@/ui/input/editor/components/CustomMentionMenuListItem';
import {
  type CustomMentionMenuProps,
  type MentionItem,
} from '@/ui/input/editor/components/types';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isDefined } from 'twenty-shared/utils';

export type { MentionItem };

const MenuPixelWidth = 240;

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

export const CustomMentionMenu = ({
  items,
  selectedIndex,
}: CustomMentionMenuProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
  });

  const { setSelectedItemId } = useSelectableList(MENTION_MENU_LIST_ID);

  useEffect(() => {
    if (!isDefined(selectedIndex) || !isDefined(items)) return;

    const selectedItem = items[selectedIndex];

    if (isDefined(selectedItem) && isDefined(selectedItem.recordId)) {
      setSelectedItemId(selectedItem.recordId);
    }
  }, [items, selectedIndex, setSelectedItemId]);

  const handleContainerClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
  };

  if (!isDefined(items) || items.length === 0) {
    return null;
  }

  const filteredItems = items.filter(
    (item) => isDefined(item.recordId) && isDefined(item.objectNameSingular),
  );

  return (
    <StyledContainer ref={refs.setReference}>
      <>
        {createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            onClick={handleContainerClick}
          >
            <OverlayContainer
              ref={refs.setFloating}
              style={floatingStyles}
              data-click-outside-id={MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
            >
              <DropdownContent widthInPixels={MenuPixelWidth}>
                <DropdownMenuItemsContainer hasMaxHeight>
                  <SelectableList
                    focusId={MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
                    selectableListInstanceId={MENTION_MENU_LIST_ID}
                    selectableItemIdArray={filteredItems.map(
                      (item) => item.recordId!,
                    )}
                  >
                    {filteredItems.map((item) => (
                      <CustomMentionMenuListItem
                        key={item.recordId!}
                        recordId={item.recordId!}
                        onClick={() => item.onItemClick()}
                        objectNameSingular={item.objectNameSingular!}
                      />
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
