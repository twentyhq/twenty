import { styled } from '@linaria/react';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { t } from '@lingui/core/macro';
import { type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/MentionMenuDropdownClickOutsideId';
import { MentionMenuListItem } from '@/mention/components/MentionMenuListItem';
import { type CustomMentionMenuProps } from '@/blocknote-editor/types/SuggestionMenuItems';
import { BLOCK_NOTE_SUGGESTION_MENU_ID } from '@/blocknote-editor/constants/BlockNoteSuggestionMenuId';
import { getBlockNoteSuggestionMenuItemId } from '@/blocknote-editor/utils/getBlockNoteSuggestionMenuItemId';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  height: 1px;
  width: 1px;
`;

export const CustomMentionMenu = ({
  items,
  selectedIndex,
  onItemClick,
}: CustomMentionMenuProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
  });

  const handleContainerClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
  };

  if (!isDefined(items) || items.length === 0) {
    return null;
  }

  const filteredItems = items.filter(
    (item) =>
      isDefined(item.recordId) &&
      isDefined(item.objectNameSingular) &&
      isDefined(item.objectMetadataId),
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
              id={BLOCK_NOTE_SUGGESTION_MENU_ID}
              role="listbox"
              aria-label={t`Suggestions`}
              ref={refs.setFloating}
              style={floatingStyles}
              data-click-outside-id={MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
            >
              <OverlayMenuList width={GenericDropdownContentWidth.Large}>
                {filteredItems.map((item, index) => (
                  <MentionMenuListItem
                    id={getBlockNoteSuggestionMenuItemId(index)}
                    key={item.recordId!}
                    recordId={item.recordId!}
                    objectNameSingular={item.objectNameSingular!}
                    label={item.label ?? item.title}
                    imageUrl={item.imageUrl ?? ''}
                    objectLabelSingular={item.objectLabelSingular ?? ''}
                    isSelected={index === selectedIndex}
                    onClick={() => onItemClick?.(item)}
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
