import { styled } from '@linaria/react';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { motion } from 'framer-motion';
import { type MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/MentionMenuDropdownClickOutsideId';
import { MentionMenuListItem } from '@/mention/components/MentionMenuListItem';
import { type CustomMentionMenuProps } from '@/blocknote-editor/types/SuggestionMenuItems';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { isDefined } from 'twenty-shared/utils';

const MENU_WIDTH = 240;

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
              ref={refs.setFloating}
              style={floatingStyles}
              data-click-outside-id={MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
            >
              <OverlayMenuList width={MENU_WIDTH}>
                {filteredItems.map((item, index) => (
                  <MentionMenuListItem
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
