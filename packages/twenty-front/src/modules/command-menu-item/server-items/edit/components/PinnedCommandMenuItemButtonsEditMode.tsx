import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { matchesObjectMetadataId } from '@/command-menu-item/server-items/common/utils/matchesObjectMetadataId';
import { PinnedCommandMenuItemsInlineMeasurements } from '@/command-menu-item/server-items/display/components/PinnedCommandMenuItemsInlineMeasurements';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/server-items/display/constants/PinnedCommandMenuItemsGap';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/server-items/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { commandMenuItemEditSelectionModeState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditSelectionModeState';
import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { interpolateCommandMenuItemLabel } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const StyledActionContainer = styled(motion.div)`
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

export const PinnedCommandMenuItemButtonsEditMode = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const editObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const commandMenuItemsDraft =
    useAtomStateValue(commandMenuItemsDraftState) ?? [];
  const commandMenuItemEditSelectionMode = useAtomStateValue(
    commandMenuItemEditSelectionModeState,
  );

  const allowedAvailabilityTypes = useMemo(
    () =>
      new Set<CommandMenuItemAvailabilityType>([
        CommandMenuItemAvailabilityType.GLOBAL,
        commandMenuItemEditSelectionMode === 'selection'
          ? CommandMenuItemAvailabilityType.RECORD_SELECTION
          : CommandMenuItemAvailabilityType.FALLBACK,
      ]),
    [commandMenuItemEditSelectionMode],
  );

  const getDisplayLabel = (item: CommandMenuItemFieldsFragment) =>
    interpolateCommandMenuItemLabel({
      label: item.label,
      context: { objectMetadataItem: editObjectMetadataItem ?? {} },
    }) ?? item.label;

  const pinnedCommandMenuItems: CommandMenuItemConfig[] = useMemo(
    () =>
      commandMenuItemsDraft
        .filter(matchesObjectMetadataId(contextStoreCurrentObjectMetadataItemId))
        .filter((item) => allowedAvailabilityTypes.has(item.availabilityType))
        .filter((item) => item.isPinned)
        .map((item) => {
          const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);
          const label = getDisplayLabel(item);
          const key = `edit-preview-${item.id}`;

          return {
            type: CommandMenuItemType.Standard,
            scope: CommandMenuItemScope.Global,
            key,
            label,
            shortLabel: item.shortLabel,
            position: item.position,
            Icon,
            isPinned: true,
            shouldBeRegistered: () => true,
            component: (
              <CommandMenuButton
                command={{ key, label, shortLabel: item.shortLabel, Icon }}
                disabled
              />
            ),
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      commandMenuItemsDraft,
      contextStoreCurrentObjectMetadataItemId,
      allowedAvailabilityTypes,
      editObjectMetadataItem,
      getIcon,
    ],
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
              {pinnedInlineCommandMenuItems.map(
                (pinnedInlineCommandMenuItem) => (
                  <StyledActionContainer
                    key={pinnedInlineCommandMenuItem.key}
                    layout
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'unset', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{
                      duration: theme.animation.duration.instant,
                      ease: 'easeInOut',
                    }}
                  >
                    {pinnedInlineCommandMenuItem.component}
                  </StyledActionContainer>
                ),
              )}
            </StyledItemsContainer>
          </StyledContainer>
        </NodeDimension>
      </StyledWrapper>
    </>
  );
};
