import { PinnedCommandMenuItemsInlineMeasurements } from '@/command-menu-item/display/components/PinnedCommandMenuItemsInlineMeasurements';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/display/constants/PinnedCommandMenuItemsGap';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { useCommandMenuContextApi } from '@/command-menu-item/hooks/useCommandMenuContextApi';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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

export const PinnedCommandMenuItemButtonsEditMode = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const commandMenuContextApi = useCommandMenuContextApi();

  const currentObjectMetadataItemId =
    commandMenuContextApi.objectMetadataItem.id;

  const commandMenuItemsDraft =
    useAtomStateValue(commandMenuItemsDraftState) ?? [];

  const mainContextStoreHasSelectedRecords = useAtomStateValue(
    mainContextStoreHasSelectedRecordsSelector,
  );

  const allowedAvailabilityTypes = useMemo(
    () =>
      new Set<CommandMenuItemAvailabilityType>([
        CommandMenuItemAvailabilityType.GLOBAL,
        mainContextStoreHasSelectedRecords
          ? CommandMenuItemAvailabilityType.RECORD_SELECTION
          : CommandMenuItemAvailabilityType.FALLBACK,
      ]),
    [mainContextStoreHasSelectedRecords],
  );

  const pinnedCommandMenuItems = commandMenuItemsDraft
    .filter(
      doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
    )
    .filter((item) => allowedAvailabilityTypes.has(item.availabilityType))
    .filter((item) => item.isPinned);

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
              {pinnedInlineCommandMenuItems.map((item) => {
                const { iconKey, label, shortLabel } =
                  interpolateCommandMenuItemFields(item, commandMenuContextApi);

                const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

                return (
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
                    <CommandMenuButton
                      command={{
                        key: item.id,
                        label,
                        shortLabel,
                        Icon,
                      }}
                      disabled
                    />
                  </StyledCommandMenuItemContainer>
                );
              })}
            </StyledItemsContainer>
          </StyledContainer>
        </NodeDimension>
      </StyledWrapper>
    </>
  );
};
