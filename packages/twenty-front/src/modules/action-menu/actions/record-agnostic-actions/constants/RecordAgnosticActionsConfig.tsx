import { ActionOpenSidePanelPage } from '@/action-menu/actions/components/ActionOpenSidePanelPage';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/action-menu/actions/types/CommandMenuItemType';
import { CommandMenuItemViewType, SidePanelPages } from 'twenty-shared/types';
import { msg } from '@lingui/core/macro';
import { IconHistory, IconSearch, IconSparkles } from 'twenty-ui/display';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<string, CommandMenuItemConfig> = {
  [RecordAgnosticActionsKeys.SEARCH_RECORDS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [CommandMenuItemViewType.GLOBAL],
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
    type: CommandMenuItemType.Fallback,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [CommandMenuItemViewType.GLOBAL],
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
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticActionsKeys.ASK_AI,
    label: msg`Ask AI`,
    shortLabel: msg`Ask AI`,
    position: 2,
    isPinned: false,
    Icon: IconSparkles,
    availableOn: [CommandMenuItemViewType.GLOBAL],
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
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS,
    label: msg`View Previous AI Chats`,
    shortLabel: msg`Previous AI Chats`,
    position: 3,
    isPinned: false,
    Icon: IconHistory,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    component: (
      <ActionOpenSidePanelPage
        page={SidePanelPages.ViewPreviousAIChats}
        pageTitle={msg`View Previous AI Chats`}
        pageIcon={IconSparkles}
      />
    ),
    shouldBeRegistered: () => true,
  },
};
