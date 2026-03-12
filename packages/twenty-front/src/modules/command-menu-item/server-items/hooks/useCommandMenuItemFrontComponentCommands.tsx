import { Command } from '@/command-menu-item/display/components/Command';
import { HeadlessFrontComponentCommandMenuItem } from '@/command-menu-item/display/components/HeadlessFrontComponentCommandMenuItem';
import { useMountEngineCommand } from '@/command-menu-item/engine-command/hooks/useMountEngineCommand';
import { type MountedEngineCommandContext } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  type EngineComponentKey,
  useFindManyCommandMenuItemsQuery,
} from '~/generated-metadata/graphql';

type CommandMenuItemWithFrontComponent = CommandMenuItemFieldsFragment & {
  frontComponentId: string;
  conditionalAvailabilityExpression?: string | null;
};

type CommandMenuItemWithSource = CommandMenuItemFieldsFragment & {
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

type BuildCommandMenuItemFromStandardKeyParams = {
  item: CommandMenuItemWithSource;
  engineComponentKey: EngineComponentKey;
  type?: CommandMenuItemType;
  scope: CommandMenuItemScope;
  isPinned: boolean;
  getIcon: ReturnType<typeof useIcons>['getIcon'];
  commandMenuContextApi: CommandMenuContextApi;
  mountEngineCommand: (
    engineCommandId: string,
    context: MountedEngineCommandContext,
  ) => void;
  contextStoreInstanceId: string;
};

const buildCommandItemFromEngineKey = ({
  item,
  engineComponentKey,
  type = CommandMenuItemType.Standard,
  scope,
  isPinned,
  getIcon,
  commandMenuContextApi,
  mountEngineCommand,
  contextStoreInstanceId,
}: BuildCommandMenuItemFromStandardKeyParams) => {
  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  const handleClick = () => {
    mountEngineCommand(item.id, {
      engineComponentKey,
      contextStoreInstanceId,
    });
  };

  return {
    type,
    key: `command-menu-item-engine-${item.id}`,
    scope,
    label: item.label,
    shortLabel: item.shortLabel ?? undefined,
    position: item.position,
    isPinned,
    Icon,
    shouldBeRegistered: () =>
      evaluateConditionalAvailabilityExpression(
        item.conditionalAvailabilityExpression,
        commandMenuContextApi,
      ),
    component: <Command onClick={handleClick} />,
  };
};

export const useCommandMenuItemFrontComponentCommands = (
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { getIcon } = useIcons();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();
  const mountEngineCommand = useMountEngineCommand();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

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

  const { data } = useFindManyCommandMenuItemsQuery();

  const allItems = data?.commandMenuItems ?? [];

  const objectMatches = (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId ===
      contextStoreCurrentObjectMetadataItemId;

  const itemsWithObjectMatches = allItems.filter(objectMatches);

  const buildCommandMenuItem = ({
    item,
    scope,
    isPinned,
    typeOverride,
  }: {
    item: CommandMenuItemFieldsFragment;
    scope: CommandMenuItemScope;
    isPinned: boolean;
    typeOverride?: CommandMenuItemType;
  }) => {
    if (isDefined(item.engineComponentKey)) {
      return buildCommandItemFromEngineKey({
        item,
        engineComponentKey: item.engineComponentKey,
        type: typeOverride,
        scope,
        isPinned,
        getIcon,
        commandMenuContextApi,
        mountEngineCommand,
        contextStoreInstanceId,
      });
    }

    if (isDefined(item.frontComponentId)) {
      return buildCommandMenuItemFromFrontComponent({
        item: item as CommandMenuItemWithFrontComponent,
        type: typeOverride,
        scope,
        isPinned,
        getIcon,
        openFrontComponentInSidePanel,
        mountHeadlessFrontComponent,
        commandMenuContextApi,
        mountContext,
      });
    }

    return null;
  };

  const globalItems = itemsWithObjectMatches.filter(
    (item) => item.availabilityType === CommandMenuItemAvailabilityType.GLOBAL,
  );

  const recordScopedItems = itemsWithObjectMatches.filter(
    (item) =>
      item.availabilityType ===
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
  );

  const fallbackItems = itemsWithObjectMatches.filter(
    (item) =>
      item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
  );

  const globalCommandMenuItems = globalItems
    .map((item) =>
      buildCommandMenuItem({
        item,
        scope: CommandMenuItemScope.Global,
        isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      }),
    )
    .filter(isDefined);

  const recordScopedCommandMenuItems = hasRecordSelection
    ? recordScopedItems
        .map((item) =>
          buildCommandMenuItem({
            item,
            scope: CommandMenuItemScope.RecordSelection,
            isPinned: !contextStoreIsPageInEditMode && item.isPinned,
          }),
        )
        .filter(isDefined)
    : [];

  const fallbackCommandMenuItems = fallbackItems
    .map((item) =>
      buildCommandMenuItem({
        item,
        scope: CommandMenuItemScope.Global,
        isPinned: false,
        typeOverride: CommandMenuItemType.Fallback,
      }),
    )
    .filter(isDefined);

  return [
    ...globalCommandMenuItems,
    ...recordScopedCommandMenuItems,
    ...fallbackCommandMenuItems,
  ]
    .filter((item) => item.shouldBeRegistered())
    .sort((a, b) => a.position - b.position);
};
