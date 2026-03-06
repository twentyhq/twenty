import { Action } from '@/action-menu/actions/components/Action';
import { HeadlessFrontComponentAction } from '@/action-menu/actions/display/components/HeadlessFrontComponentAction';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
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
  FeatureFlagKey,
  useFindManyCommandMenuItemsQuery,
} from '~/generated-metadata/graphql';

type CommandMenuItemWithFrontComponent = CommandMenuItemFieldsFragment & {
  frontComponentId: string;
  conditionalAvailabilityExpression?: string | null;
};

type BuildActionFromItemParams = {
  item: CommandMenuItemWithFrontComponent;
  scope: ActionScope;
  index: number;
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
const buildActionFromItem = ({
  item,
  scope,
  index,
  isPinned,
  getIcon,
  openFrontComponentInSidePanel,
  mountHeadlessFrontComponent,
  mountContext,
  commandMenuContextApi,
}: BuildActionFromItemParams) => {
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
    type: ActionType.FrontComponent,
    key: `command-menu-item-front-component-${item.id}`,
    scope,
    label: displayLabel,
    shortLabel: displayLabel,
    position: index,
    isPinned,
    Icon,
    shouldBeRegistered: () =>
      evaluateConditionalAvailabilityExpression(
        item.conditionalAvailabilityExpression,
        commandMenuContextApi,
      ),
    component: isHeadless ? (
      <HeadlessFrontComponentAction
        frontComponentId={item.frontComponentId}
        onClick={handleClick}
      />
    ) : (
      <Action onClick={handleClick} />
    ),
  };
};

export const useCommandMenuItemFrontComponentActions = (
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { getIcon } = useIcons();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { actionMenuType } = useContext(ActionMenuContext);

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

  const mountContext: HeadlessFrontComponentMountContext | undefined =
    selectedRecordIds.length === 1 && isDefined(currentObjectMetadataItem)
      ? {
          recordId: selectedRecordIds[0],
          objectNameSingular: currentObjectMetadataItem.nameSingular,
        }
      : undefined;

  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const { data } = useFindManyCommandMenuItemsQuery({
    skip:
      !isCommandMenuItemEnabled ||
      (actionMenuType !== 'command-menu' &&
        actionMenuType !== 'command-menu-show-page-action-menu-dropdown'),
  });

  const frontComponentItems =
    data?.commandMenuItems?.filter(
      (item): item is CommandMenuItemWithFrontComponent =>
        isDefined(item.frontComponentId),
    ) ?? [];

  const selectedRecordCount =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds.length
      : 0;

  const objectMatches = (item: CommandMenuItemWithFrontComponent) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId ===
      contextStoreCurrentObjectMetadataItemId;

  const globalItems = frontComponentItems.filter(
    (item) => item.availabilityType === CommandMenuItemAvailabilityType.GLOBAL,
  );

  const recordScopedItems = frontComponentItems.filter((item) => {
    if (!objectMatches(item)) return false;

    return (
      item.availabilityType ===
        CommandMenuItemAvailabilityType.RECORD_SELECTION &&
      selectedRecordCount >= 1
    );
  });

  const globalActions = globalItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.Global,
      index,
      isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInSidePanel,
      mountHeadlessFrontComponent,
      commandMenuContextApi,
    }),
  );

  const recordScopedActions = recordScopedItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.RecordSelection,
      index,
      isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInSidePanel,
      mountHeadlessFrontComponent,
      commandMenuContextApi,
      mountContext,
    }),
  );

  return [...globalActions, ...recordScopedActions];
};
