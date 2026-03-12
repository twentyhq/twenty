import { Command } from '@/command-menu-item/display/components/Command';
import { HeadlessFrontComponentCommandMenuItem } from '@/command-menu-item/display/components/HeadlessFrontComponentCommandMenuItem';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/display';

import { type HeadlessFrontComponentMountContext } from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useQuery } from '@apollo/client/react';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  FindManyCommandMenuItemsDocument,
} from '~/generated-metadata/graphql';

type CommandMenuItemWithFrontComponent = CommandMenuItemFieldsFragment & {
  frontComponentId: string;
  conditionalAvailabilityExpression?: string | null;
};

type BuildCommandMenuItemFromFrontComponentParams = {
  item: CommandMenuItemWithFrontComponent;
  type?: CommandMenuItemType;
  scope: CommandMenuItemScope;
  isPinned: boolean;
  getIcon: ReturnType<typeof useIcons>['getIcon'];
  openFrontComponentInSidePanel: (params: {
    frontComponentId: string;
    pageTitle: string;
    pageIcon: IconComponent;
    recordContext?: {
      recordId: string;
      objectNameSingular: string;
    };
  }) => void;
  mountHeadlessFrontComponent: (
    frontComponentId: string,
    context?: HeadlessFrontComponentMountContext,
  ) => void;
  mountContext?: HeadlessFrontComponentMountContext;
  commandMenuContextApi: CommandMenuContextApi;
};

// TODO: we should remove this backward compatibility logic in the future
// once we have migrated all command menu items
const buildCommandMenuItemFromFrontComponent = ({
  item,
  type = CommandMenuItemType.FrontComponent,
  scope,
  isPinned,
  getIcon,
  openFrontComponentInSidePanel,
  mountHeadlessFrontComponent,
  mountContext,
  commandMenuContextApi,
}: BuildCommandMenuItemFromFrontComponentParams) => {
  const displayLabel = item.label;

  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  const isHeadless = item.frontComponent?.isHeadless === true;

  const handleClick = () => {
    if (isHeadless) {
      mountHeadlessFrontComponent(item.frontComponentId, mountContext);
    } else {
      openFrontComponentInSidePanel({
        frontComponentId: item.frontComponentId,
        pageTitle: displayLabel,
        pageIcon: Icon,
        recordContext: isDefined(mountContext)
          ? {
              recordId: mountContext.recordId,
              objectNameSingular: mountContext.objectNameSingular,
            }
          : undefined,
      });
    }
  };

  return {
    type,
    key: `command-menu-item-front-component-${item.id}`,
    scope,
    label: displayLabel,
    shortLabel: item.shortLabel ?? undefined,
    position: item.position,
    isPinned,
    Icon,
    shouldBeRegistered: () =>
      evaluateConditionalAvailabilityExpression(
        item.conditionalAvailabilityExpression,
        commandMenuContextApi,
      ),
    component: isHeadless ? (
      <HeadlessFrontComponentCommandMenuItem
        frontComponentId={item.frontComponentId}
        onClick={handleClick}
      />
    ) : (
      <Command onClick={handleClick} />
    ),
  };
};

export const useCommandMenuItemFrontComponentCommands = (
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { getIcon } = useIcons();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const currentObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const hasRecordSelection =
    selectedRecordIds.length >= 1 ||
    contextStoreTargetedRecordsRule.mode === 'exclusion';

  const mountContext: HeadlessFrontComponentMountContext | undefined =
    selectedRecordIds.length === 1 && isDefined(currentObjectMetadataItem)
      ? {
          recordId: selectedRecordIds[0],
          objectNameSingular: currentObjectMetadataItem.nameSingular,
        }
      : undefined;

  const { data } = useQuery(FindManyCommandMenuItemsDocument);

  const frontComponentItems =
    data?.commandMenuItems?.filter(
      (item): item is CommandMenuItemWithFrontComponent =>
        isDefined(item.frontComponentId),
    ) ?? [];

  const objectMatches = (item: CommandMenuItemWithFrontComponent) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId ===
      contextStoreCurrentObjectMetadataItemId;

  const frontComponentItemsWithObjectMatches =
    frontComponentItems.filter(objectMatches);

  const globalItems = frontComponentItemsWithObjectMatches.filter(
    (item) => item.availabilityType === CommandMenuItemAvailabilityType.GLOBAL,
  );

  const recordScopedItems = frontComponentItemsWithObjectMatches.filter(
    (item) =>
      item.availabilityType ===
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
  );

  const fallbackItems = frontComponentItemsWithObjectMatches.filter(
    (item) =>
      item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
  );

  const globalCommandMenuItems = globalItems.map((item) =>
    buildCommandMenuItemFromFrontComponent({
      item,
      scope: CommandMenuItemScope.Global,
      isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInSidePanel,
      mountHeadlessFrontComponent,
      commandMenuContextApi,
    }),
  );

  const recordScopedCommandMenuItems = hasRecordSelection
    ? recordScopedItems.map((item) =>
        buildCommandMenuItemFromFrontComponent({
          item,
          scope: CommandMenuItemScope.RecordSelection,
          isPinned: !contextStoreIsPageInEditMode && item.isPinned,
          getIcon,
          openFrontComponentInSidePanel,
          mountHeadlessFrontComponent,
          commandMenuContextApi,
          mountContext,
        }),
      )
    : [];

  const fallbackCommandMenuItems = fallbackItems.map((item) =>
    buildCommandMenuItemFromFrontComponent({
      item,
      type: CommandMenuItemType.Fallback,
      scope: CommandMenuItemScope.Global,
      isPinned: false,
      getIcon,
      openFrontComponentInSidePanel,
      mountHeadlessFrontComponent,
      commandMenuContextApi,
    }),
  );

  return [
    ...globalCommandMenuItems,
    ...recordScopedCommandMenuItems,
    ...fallbackCommandMenuItems,
  ]
    .filter((item) => item.shouldBeRegistered())
    .sort((a, b) => a.position - b.position);
};
