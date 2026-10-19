import { useBlockNoteEditor } from '@blocknote/react';
import { styled } from '@linaria/react';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { t } from '@lingui/core/macro';
import { createPortal } from 'react-dom';

import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { CustomSlashMenuListItem } from '@/blocknote-editor/components/CustomSlashMenuListItem';
import { BLOCK_NOTE_SUGGESTION_MENU_ID } from '@/blocknote-editor/constants/BlockNoteSuggestionMenuId';
import type { CustomSlashMenuProps } from '@/blocknote-editor/types/SuggestionMenuItems';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

export const CustomSlashMenu = ({
  items,
  selectedIndex,
  onItemClick,
}: CustomSlashMenuProps) => {
  const editor = useBlockNoteEditor();

  const currentBlock = editor?.getTextCursorPosition()?.block;
  const blockType = currentBlock?.type;
  const headingLevel =
    blockType === 'heading' ? Number(currentBlock?.props?.level) : null;

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
              id={BLOCK_NOTE_SUGGESTION_MENU_ID}
              role="listbox"
              aria-label={t`Suggestions`}
              ref={refs.setFloating}
              style={floatingStyles}
              data-click-outside-id={SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
            >
              <OverlayMenuList>
                {items.map((item, index) => (
                  <CustomSlashMenuListItem
                    key={item.title}
                    item={item}
                    index={index}
                    isSelected={index === selectedIndex}
                    onSelect={() => onItemClick?.(item)}
                  />
                ))}
              </OverlayMenuList>
            </OverlayContainer>
          </motion.div>,
          document.body,
        )}
      </>
    </StyledContainer>
  );
};
