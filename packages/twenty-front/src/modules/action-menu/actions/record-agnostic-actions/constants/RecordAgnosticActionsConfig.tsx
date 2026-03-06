import { ActionOpenSidePanelPage } from '@/action-menu/actions/components/ActionOpenSidePanelPage';
import { EditNavigationSidebarNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/EditNavigationSidebarNoSelectionRecordAction';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { msg } from '@lingui/core/macro';
import { ActionViewType, SidePanelPages } from 'twenty-shared/types';
import {
  IconHistory,
  IconLayout,
  IconSearch,
  IconSparkles,
} from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<string, ActionConfig> = {
  [RecordAgnosticActionsKeys.SEARCH_RECORDS]: {
    type: ActionType.Standard,
    scope: ActionScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    component: (
      <ActionOpenSidePanelPage
        page={SidePanelPages.SearchRecords}
        pageTitle={msg`Search`}
        pageIcon={IconSearch}
        shouldResetSearchState={true}
      />
    ),
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK]: {
    type: ActionType.Fallback,
    scope: ActionScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    component: (
      <ActionOpenSidePanelPage
        page={SidePanelPages.SearchRecords}
        pageTitle={msg`Search`}
        pageIcon={IconSearch}
      />
    ),
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.ASK_AI]: {
    type: ActionType.Standard,
    scope: ActionScope.Global,
    key: RecordAgnosticActionsKeys.ASK_AI,
    label: msg`Ask AI`,
    shortLabel: msg`Ask AI`,
    position: 2,
    isPinned: false,
    Icon: IconSparkles,
    availableOn: [ActionViewType.GLOBAL],
    component: (
      <ActionOpenSidePanelPage
        page={SidePanelPages.AskAI}
        pageTitle={msg`Ask AI`}
        pageIcon={IconSparkles}
      />
    ),
    hotKeys: ['@'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS]: {
    type: ActionType.Standard,
    scope: ActionScope.Global,
    key: RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS,
    label: msg`View Previous AI Chats`,
    shortLabel: msg`Previous AI Chats`,
    position: 3,
    isPinned: false,
    Icon: IconHistory,
    availableOn: [ActionViewType.GLOBAL],
    component: (
      <ActionOpenSidePanelPage
        page={SidePanelPages.ViewPreviousAIChats}
        pageTitle={msg`View Previous AI Chats`}
        pageIcon={IconSparkles}
      />
    ),
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.EDIT_NAVIGATION_SIDEBAR]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: RecordAgnosticActionsKeys.EDIT_NAVIGATION_SIDEBAR,
    label: msg`Edit navigation sidebar`,
    shortLabel: msg`Edit sidebar`,
    position: 4,
    Icon: IconLayout,
    isPinned: false,
    availableOn: [ActionViewType.GLOBAL],
    shouldBeRegistered: ({ isFeatureFlagEnabled }) =>
      isFeatureFlagEnabled(
        FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
      ),
    component: <EditNavigationSidebarNoSelectionRecordAction />,
  },
};
