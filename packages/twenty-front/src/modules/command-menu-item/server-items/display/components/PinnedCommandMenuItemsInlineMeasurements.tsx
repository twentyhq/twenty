import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/server-items/display/constants/PinnedCommandMenuItemsGap';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { styled } from '@linaria/react';

type ElementDimensions = {
  width: number;
  height: number;
};

type PinnedCommandMenuItemsInlineMeasurementsProps = {
  pinnedCommandMenuItems: CommandMenuItemConfig[];
  onPinnedCommandMenuItemDimensionChange: (
    commandMenuItemKey: string,
  ) => (dimensions: ElementDimensions) => void;
};

const StyledHiddenMeasurementsContainer = styled.div`
  display: flex;
  gap: ${PINNED_COMMAND_MENU_ITEMS_GAP}px;
  pointer-events: none;
  position: absolute;
  top: -9999px;
  visibility: hidden;
`;

export const PinnedCommandMenuItemsInlineMeasurements = ({
  pinnedCommandMenuItems,
  onPinnedCommandMenuItemDimensionChange,
}: PinnedCommandMenuItemsInlineMeasurementsProps) => {
  return (
    <StyledHiddenMeasurementsContainer>
      {pinnedCommandMenuItems.map((pinnedCommandMenuItem) => (
        <NodeDimension
          key={pinnedCommandMenuItem.key}
          onDimensionChange={onPinnedCommandMenuItemDimensionChange(
            pinnedCommandMenuItem.key,
          )}
        >
          <CommandMenuButton
            command={{
              key: `${pinnedCommandMenuItem.key}-inline-measurement`,
              label: pinnedCommandMenuItem.label,
              shortLabel: pinnedCommandMenuItem.shortLabel,
              Icon: pinnedCommandMenuItem.Icon,
              isPrimaryCTA: pinnedCommandMenuItem.isPrimaryCTA,
            }}
          />
        </NodeDimension>
      ))}
    </StyledHiddenMeasurementsContainer>
  );
};
