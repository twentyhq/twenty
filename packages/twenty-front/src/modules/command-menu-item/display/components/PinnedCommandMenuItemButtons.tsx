import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PinnedCommandMenuItemsInlineMeasurements } from '@/command-menu-item/display/components/PinnedCommandMenuItemsInlineMeasurements';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { getLabelledPinnedCommandMenuItemId } from '@/command-menu-item/display/utils/getLabelledPinnedCommandMenuItemId';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

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
  align-items: center;
  display: flex;
  gap: ${PINNED_COMMAND_MENU_ITEMS_GAP}px;
  justify-content: flex-end;
  min-width: 0;
  width: 100%;
`;

const StyledItemsContainer = styled.div<{ shouldReverse: boolean }>`
  display: flex;
  flex-direction: ${({ shouldReverse }) =>
    shouldReverse ? 'row-reverse' : 'row'};
  gap: ${PINNED_COMMAND_MENU_ITEMS_GAP}px;
  max-width: 100%;
  overflow: hidden;
`;

export const PinnedCommandMenuItemButtons = ({
  leadingAction,
}: {
  // Rendered inside the right-aligned cluster, before the pinned buttons, so
  // an options menu can sit leftmost of the group instead of being pushed to
  // the far side by the measurement wrapper stretching over the free space.
  leadingAction?: React.ReactNode;
}) => {
  const { theme } = useContext(ThemeContext);
  const { commandMenuItems, containerType } = useContext(CommandMenuContext);
  const isMobile = useIsMobile();

  // The footer keeps its label rightmost. Headers reverse the row so labels sit
  // left of the icons.
  const isSidePanelFooter =
    containerType === CommandMenuItemContainerType.SidePanelFooter;

  // A record header keeps its breadcrumb on mobile, so its actions stay icons
  // and leave the record name room. Index and standalone headers drop their
  // title there, which frees the width for one label.
  const isRecordPageHeader =
    containerType === CommandMenuItemContainerType.ShowPageHeader;

  const shouldLabelSingleCommandMenuItem =
    isSidePanelFooter || (isMobile && !isRecordPageHeader);

  const pinnedCommandMenuItems = useMemo(
    () => commandMenuItems.filter((item) => item.isPinned === true),
    [commandMenuItems],
  );

  const labelledCommandMenuItemId = shouldLabelSingleCommandMenuItem
    ? getLabelledPinnedCommandMenuItemId(pinnedCommandMenuItems)
    : null;

  const shouldHideCommandMenuItemLabel = (commandMenuItemId: string) =>
    (isMobile && isRecordPageHeader) ||
    (shouldLabelSingleCommandMenuItem &&
      commandMenuItemId !== labelledCommandMenuItemId);

  const {
    pinnedInlineCommandMenuItems,
    pinnedOverflowCommandMenuItems,
    onContainerDimensionChange,
    onLeadingActionDimensionChange,
    onCommandMenuItemDimensionChange,
  } = usePinnedCommandMenuItemsInlineLayout({
    pinnedCommandMenuItems,
    layoutKey: isSidePanelFooter ? 'side-panel-footer' : 'page-header',
  });

  const isCommandMenuItemLabelled = (
    commandMenuItem: CommandMenuItemFieldsFragment,
  ) =>
    isDefined(commandMenuItem.shortLabel) &&
    !shouldHideCommandMenuItemLabel(commandMenuItem.id);

  // Labels last so they land rightmost in the footer, and leftmost in the
  // header once the row is reversed.
  const displayedInlineCommandMenuItems = [
    ...pinnedInlineCommandMenuItems.filter(
      (item) => !isCommandMenuItemLabelled(item),
    ),
    ...pinnedInlineCommandMenuItems.filter(isCommandMenuItemLabelled),
  ];

  return (
    <>
      <PinnedCommandMenuItemsInlineMeasurements
        pinnedCommandMenuItems={[
          ...pinnedInlineCommandMenuItems,
          ...pinnedOverflowCommandMenuItems,
        ]}
        shouldHideCommandMenuItemLabel={shouldHideCommandMenuItemLabel}
        onPinnedCommandMenuItemDimensionChange={
          onCommandMenuItemDimensionChange
        }
      />
      <StyledWrapper>
        <NodeDimension onDimensionChange={onContainerDimensionChange}>
          <StyledContainer>
            {isDefined(leadingAction) && (
              <NodeDimension onDimensionChange={onLeadingActionDimensionChange}>
                {leadingAction}
              </NodeDimension>
            )}
            <StyledItemsContainer shouldReverse={!isSidePanelFooter}>
              {displayedInlineCommandMenuItems.map((item) => (
                <StyledCommandMenuItemContainer
                  key={item.id}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'unset', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{
                    duration: theme.animation.duration.instant,
                    ease: 'easeInOut',
                  }}
                >
                  <CommandMenuItemRenderer
                    item={item}
                    shouldHideLabel={shouldHideCommandMenuItemLabel(item.id)}
                    isPrimaryAction={
                      item.engineComponentKey ===
                        EngineComponentKey.CREATE_NEW_RECORD ||
                      item.engineComponentKey ===
                        EngineComponentKey.COMPOSE_CAMPAIGN ||
                      item.engineComponentKey ===
                        EngineComponentKey.SEND_MESSAGE_CAMPAIGN
                    }
                  />
                </StyledCommandMenuItemContainer>
              ))}
            </StyledItemsContainer>
          </StyledContainer>
        </NodeDimension>
      </StyledWrapper>
    </>
  );
};
