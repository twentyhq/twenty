import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useOpenFrontComponentInCommandMenu } from '@/command-menu/hooks/useOpenFrontComponentInCommandMenu';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
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
};

const buildActionFromItem = ({
  item,
  scope,
  index,
  isPinned,
  getIcon,
  openFrontComponentInCommandMenu,
}: BuildActionFromItemParams) => {
  const displayLabel = item.label;

  const Icon = getIcon(item.icon, COMMAND_MENU_DEFAULT_ICON);

  return {
    type: ActionType.FrontComponent,
    key: `command-menu-item-front-component-${item.id}`,
    scope,
    label: displayLabel,
    shortLabel: displayLabel,
    position: index,
    isPinned,
    Icon,
    shouldBeRegistered: () => true,
    component: (
      <Action
        onClick={() =>
          openFrontComponentInCommandMenu({
            frontComponentId: item.frontComponentId,
            pageTitle: displayLabel,
            pageIcon: Icon,
          })
        }
        closeSidePanelOnCommandMenuListActionExecution={false}
      />
    ),
  };
};

export const useCommandMenuItemFrontComponentActions = () => {
  const { getIcon } = useIcons();
  const { openFrontComponentInCommandMenu } =
    useOpenFrontComponentInCommandMenu();

  const isPageInEditMode = useRecoilComponentValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { actionMenuType } = useContext(ActionMenuContext);

  const currentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const targetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

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
    targetedRecordsRule.mode === 'selection'
      ? targetedRecordsRule.selectedRecordIds.length
      : 0;

  const objectMatches = (item: CommandMenuItemWithFrontComponent) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId === currentObjectMetadataItemId;

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

  const globalActions = globalItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.Global,
      index,
      isPinned: !isPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInCommandMenu,
    }),
  );

  const recordScopedActions = recordScopedItems.map((item, index) =>
    buildActionFromItem({
      item,
      scope: ActionScope.RecordSelection,
      index,
      isPinned: !isPageInEditMode && item.isPinned,
      getIcon,
      openFrontComponentInCommandMenu,
    }),
  );

  return [...globalActions, ...recordScopedActions];
};
