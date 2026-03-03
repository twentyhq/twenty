import { Action } from '@/action-menu/actions/components/Action';
import { HeadlessFrontComponentAction } from '@/action-menu/actions/display/components/HeadlessFrontComponentAction';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { evaluateConditionalAvailabilityExpression } from '@/action-menu/actions/utils/evaluateConditionalAvailabilityExpression';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { useOpenFrontComponentInCommandMenu } from '@/command-menu/hooks/useOpenFrontComponentInCommandMenu';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useStore } from 'jotai';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/display';

import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import {
  type CommandMenuItemFieldsFragment,
  CommandMenuItemAvailabilityType,
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
  openFrontComponentInCommandMenu: (params: {
    frontComponentId: string;
    pageTitle: string;
    pageIcon: IconComponent;
  }) => void;
  mountHeadlessFrontComponent: (frontComponentId: string) => void;
  evaluationContext: Record<string, unknown>;
};

// TODO: we should remove this backward compatibility logic in the future
// once we have migrated all command menu items
const buildActionFromItem = ({
  item,
  scope,
  index,
  isPinned,
  getIcon,
  openFrontComponentInCommandMenu,
  mountHeadlessFrontComponent,
  evaluationContext,
}: BuildActionFromItemParams) => {
  const displayLabel = item.label;

  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  const isHeadless = item.frontComponent?.isHeadless === true;

  const handleClick = () => {
    if (isHeadless) {
      mountHeadlessFrontComponent(item.frontComponentId);
    } else {
      openFrontComponentInCommandMenu({
        frontComponentId: item.frontComponentId,
        pageTitle: displayLabel,
        pageIcon: Icon,
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
        evaluationContext,
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

export const useCommandMenuItemFrontComponentActions = () => {
  const { getIcon } = useIcons();
  const { openFrontComponentInCommandMenu } =
    useOpenFrontComponentInCommandMenu();
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();
  const store = useStore();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { actionMenuType, isInRightDrawer } = useContext(ActionMenuContext);

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const { sortedFavorites: favorites } = useFavorites();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const isFavorite = (() => {
    if (!isDefined(recordId)) return false;

    if (isNavigationMenuItemEditingEnabled && isDefined(objectMetadataItem)) {
      return !!navigationMenuItems?.find(
        (item) =>
          item.targetRecordId === recordId &&
          item.targetObjectMetadataId === objectMetadataItem.id,
      );
    }

    return !!favorites?.find((favorite) => favorite.recordId === recordId);
  })();

  const selectedRecord =
    useAtomFamilyStateValue(recordStoreFamilyState, recordId ?? '') ||
    undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const isRemote = objectMetadataItem?.isRemote ?? false;

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const isShowPage =
    useAtomComponentStateValue(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const isSelectAll = contextStoreTargetedRecordsRule.mode === 'exclusion';

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const featureFlags: Record<string, boolean> = {};

  for (const flag of currentWorkspace?.featureFlags ?? []) {
    featureFlags[flag.key] = flag.value === true;
  }

  const targetObjectReadPermissions: Record<string, boolean> = {};
  const targetObjectWritePermissions: Record<string, boolean> = {};

  for (const metadataItem of objectMetadataItems) {
    const permissions = store.get(
      objectPermissionsFamilySelector.selectorFamily({
        objectNameSingular: metadataItem.nameSingular,
      }),
    );
    targetObjectReadPermissions[metadataItem.nameSingular] =
      permissions.canRead;
    targetObjectWritePermissions[metadataItem.nameSingular] =
      permissions.canUpdate;
  }

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
    if (item.availabilityType === CommandMenuItemAvailabilityType.SINGLE_RECORD)
      return selectedRecordCount === 1;
    if (item.availabilityType === CommandMenuItemAvailabilityType.BULK_RECORDS)
      return selectedRecordCount >= 1;
    return false;
  });

  const evaluationContext: Record<string, unknown> = {
    isShowPage,
    isInRightDrawer,
    isFavorite,
    isRemote,
    isNoteOrTask,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    objectPermissions,
    selectedRecord,
    featureFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
  };

  const globalActions = globalItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.Global,
      index,
      isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInCommandMenu,
      mountHeadlessFrontComponent,
      evaluationContext,
    }),
  );

  const recordScopedActions = recordScopedItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.RecordSelection,
      index,
      isPinned: !contextStoreIsPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInCommandMenu,
      mountHeadlessFrontComponent,
      evaluationContext,
    }),
  );

  return [...globalActions, ...recordScopedActions];
};
