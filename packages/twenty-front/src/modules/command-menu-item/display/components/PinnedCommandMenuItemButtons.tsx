import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PinnedCommandMenuItemsInlineMeasurements } from '@/command-menu-item/display/components/PinnedCommandMenuItemsInlineMeasurements';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledCommandMenuItemContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  width: 100%;
`;

const StyledItemsContainer = styled.div`
  display: flex;
  gap: ${PINNED_COMMAND_MENU_ITEMS_GAP}px;
  max-width: 100%;
  overflow: hidden;
`;

export const PinnedCommandMenuItemButtons = () => {
  const { theme } = useContext(ThemeContext);
  const { commandMenuItems } = useContext(CommandMenuContext);

  const pinnedCommandMenuItems = useMemo(
    () => commandMenuItems.filter((item) => item.isPinned === true),
    [commandMenuItems],
  );

  const {
    pinnedInlineCommandMenuItems,
    pinnedOverflowCommandMenuItems,
    onContainerDimensionChange,
    onCommandMenuItemDimensionChange,
  } = usePinnedCommandMenuItemsInlineLayout({
    pinnedCommandMenuItems,
  });

  return (
    <>
      <PinnedCommandMenuItemsInlineMeasurements
        pinnedCommandMenuItems={[
          ...pinnedInlineCommandMenuItems,
          ...pinnedOverflowCommandMenuItems,
        ]}
        onPinnedCommandMenuItemDimensionChange={
          onCommandMenuItemDimensionChange
        }
      />
      <StyledWrapper>
        <NodeDimension onDimensionChange={onContainerDimensionChange}>
          <StyledContainer>
            <StyledItemsContainer>
              {pinnedInlineCommandMenuItems.map((item) => (
                <StyledCommandMenuItemContainer
                  key={item.id}
                  layout
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'unset', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{
                    duration: theme.animation.duration.instant,
                    ease: 'easeInOut',
                  }}
                >
                  <CommandMenuItemRenderer item={item} />
                </StyledCommandMenuItemContainer>
              ))}
            </StyledItemsContainer>
          </StyledContainer>
        </NodeDimension>
      </StyledWrapper>
    </>
  );
};
