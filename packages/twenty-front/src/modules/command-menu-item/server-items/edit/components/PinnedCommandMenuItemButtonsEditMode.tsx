import { useCommandMenuContextApi } from '@/command-menu-item/server-items/common/hooks/useCommandMenuContextApi';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/server-items/common/utils/doesCommandMenuItemMatchObjectMetadataId';
import { PinnedCommandMenuItemsInlineMeasurements } from '@/command-menu-item/server-items/display/components/PinnedCommandMenuItemsInlineMeasurements';
import { PINNED_COMMAND_MENU_ITEMS_GAP } from '@/command-menu-item/server-items/display/constants/PinnedCommandMenuItemsGap';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/server-items/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { interpolateCommandMenuItemTemplate } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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

  const interpolateLabel = (rawLabel: string | null | undefined) =>
    interpolateCommandMenuItemTemplate({
      label: rawLabel,
      context: commandMenuContextApi,
    });

  const pinnedCommandMenuItems: CommandMenuItemConfig[] = useMemo(
    () =>
      commandMenuItemsDraft
        .filter(
          doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
        )
        .filter((item) => allowedAvailabilityTypes.has(item.availabilityType))
        .filter((item) => item.isPinned)
        .map((item) => {
          const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);
          const label = interpolateLabel(item.label) ?? item.label;
          const shortLabel = interpolateLabel(item.shortLabel);
          const key = `edit-preview-${item.id}`;

          return {
            type: CommandMenuItemType.Standard,
            scope: CommandMenuItemScope.Global,
            key,
            label,
            shortLabel,
            position: item.position,
            Icon,
            isPinned: true,
            shouldBeRegistered: () => true,
            component: (
              <CommandMenuButton
                command={{ key, label, shortLabel, Icon }}
                disabled
              />
            ),
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentObjectMetadataItemId,
      allowedAvailabilityTypes,
      commandMenuContextApi,
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
