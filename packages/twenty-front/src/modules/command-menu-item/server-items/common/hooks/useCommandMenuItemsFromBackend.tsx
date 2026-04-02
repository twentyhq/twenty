import { FrontComponentCommandMenuItem } from '@/command-menu-item/display/components/FrontComponentCommandMenuItem';
import { HeadlessCommandMenuItem } from '@/command-menu-item/display/components/HeadlessCommandMenuItem';
import { commandMenuItemsSelector } from '@/command-menu-item/server-items/common/states/commandMenuItemsSelector';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/server-items/common/utils/doesCommandMenuItemMatchObjectMetadataId';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';

import { type CommandMenuContextApi } from 'twenty-shared/types';
import {
  evaluateConditionalAvailabilityExpression,
  interpolateCommandMenuItemLabel,
  isDefined,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
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
  commandMenuContextApi: CommandMenuContextApi;
};

const buildCommandMenuItemFromFrontComponent = ({
  item,
  type = CommandMenuItemType.FrontComponent,
  scope,
  isPinned,
  getIcon,
  commandMenuContextApi,
}: BuildCommandMenuItemFromFrontComponentParams): CommandMenuItemConfig => {
  const displayLabel = interpolateCommandMenuItemLabel({
    label: item.label,
    context: commandMenuContextApi,
  });

  const displayShortLabel = interpolateCommandMenuItemLabel({
    label: item.shortLabel,
    context: commandMenuContextApi,
  });

  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  const isHeadless = item.frontComponent?.isHeadless === true;

  return {
    type,
    key: `command-menu-item-front-component-${item.id}`,
    id: item.id,
    scope,
    label: displayLabel,
    shortLabel: displayShortLabel,
    position: item.position,
    isPinned,
    Icon,
    hotKeys: item.hotKeys,
    component: isHeadless ? (
      <HeadlessCommandMenuItem item={item} />
    ) : (
      <FrontComponentCommandMenuItem frontComponentId={item.frontComponentId} />
    ),
  };
};

type BuildCommandMenuItemFromStandardKeyParams = {
  item: CommandMenuItemWithSource;
  type?: CommandMenuItemType;
  scope: CommandMenuItemScope;
  isPinned: boolean;
  getIcon: ReturnType<typeof useIcons>['getIcon'];
  commandMenuContextApi: CommandMenuContextApi;
};

const buildCommandItemFromEngineKey = ({
  item,
  type = CommandMenuItemType.Standard,
  scope,
  isPinned,
  getIcon,
  commandMenuContextApi,
}: BuildCommandMenuItemFromStandardKeyParams): CommandMenuItemConfig => {
  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  return {
    type,
    key: `command-menu-item-engine-${item.id}`,
    id: item.id,
    scope,
    label: interpolateCommandMenuItemLabel({
      label: item.label,
      context: commandMenuContextApi,
    }),
    shortLabel: interpolateCommandMenuItemLabel({
      label: item.shortLabel,
      context: commandMenuContextApi,
    }),
    position: item.position,
    isPinned,
    Icon,
    hotKeys: item.hotKeys,
    component: <HeadlessCommandMenuItem item={item} />,
  };
};

export const useCommandMenuItemsFromBackend = (
  commandMenuContextApi: CommandMenuContextApi,
): CommandMenuItemConfig[] => {
  const { getIcon } = useIcons();
  const currentObjectMetadataItemId =
    commandMenuContextApi.objectMetadataItem.id;

  const hasRecordSelection = commandMenuContextApi.numberOfSelectedRecords >= 1;

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  const itemsWithObjectMatches = commandMenuItems.filter(
    doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
  );
  const availableItems = itemsWithObjectMatches.filter((item) =>
    evaluateConditionalAvailabilityExpression(
      item.conditionalAvailabilityExpression,
      commandMenuContextApi,
    ),
  );

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
  }): CommandMenuItemConfig | null => {
    if (isDefined(item.frontComponentId)) {
      return buildCommandMenuItemFromFrontComponent({
        item: item as CommandMenuItemWithFrontComponent,
        type: typeOverride,
        scope,
        isPinned,
        getIcon,
        commandMenuContextApi,
      });
    }

    if (isDefined(item.engineComponentKey)) {
      return buildCommandItemFromEngineKey({
        item,
        type: typeOverride,
        scope,
        isPinned,
        getIcon,
        commandMenuContextApi,
      });
    }

    return null;
  };

  const globalItems = availableItems.filter(
    (item) => item.availabilityType === CommandMenuItemAvailabilityType.GLOBAL,
  );

  const recordScopedItems = availableItems.filter(
    (item) =>
      item.availabilityType ===
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
  );

  const fallbackItems = availableItems.filter(
    (item) =>
      item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
  );

  const globalCommandMenuItems = globalItems
    .map((item) =>
      buildCommandMenuItem({
        item,
        scope: CommandMenuItemScope.Global,
        isPinned: item.isPinned,
      }),
    )
    .filter(isDefined);

  const recordScopedCommandMenuItems = hasRecordSelection
    ? recordScopedItems
        .map((item) =>
          buildCommandMenuItem({
            item,
            scope: CommandMenuItemScope.RecordSelection,
            isPinned: item.isPinned,
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
  ].sort((a, b) => a.position - b.position);
};
