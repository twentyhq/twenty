import { CommandMenuItemOpenSidePanelPage } from '@/command-menu-item/display/components/CommandMenuItemOpenSidePanelPage';
import { RecordAgnosticCommandKeys } from '@/command-menu-item/record-agnostic/types/RecordAgnosticCommandKeys';
import { EditNavigationSidebarNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/EditNavigationSidebarNoSelectionRecordCommand';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuItemViewType, SidePanelPages } from 'twenty-shared/types';
import { msg } from '@lingui/core/macro';
import {
  IconHistory,
  IconLayout,
  IconSearch,
  IconSparkles,
} from 'twenty-ui/display';

export const RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG: Record<
  string,
  CommandMenuItemConfig
> = {
  [RecordAgnosticCommandKeys.SEARCH_RECORDS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticCommandKeys.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    component: (
      <CommandMenuItemOpenSidePanelPage
        page={SidePanelPages.SearchRecords}
        pageTitle={msg`Search`}
        pageIcon={IconSearch}
        shouldResetSearchState={true}
      />
    ),
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK]: {
    type: CommandMenuItemType.Fallback,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    component: (
      <CommandMenuItemOpenSidePanelPage
        page={SidePanelPages.SearchRecords}
        pageTitle={msg`Search`}
        pageIcon={IconSearch}
      />
    ),
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticCommandKeys.ASK_AI]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticCommandKeys.ASK_AI,
    label: msg`Ask AI`,
    shortLabel: msg`Ask AI`,
    position: 2,
    isPinned: false,
    Icon: IconSparkles,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    component: (
      <CommandMenuItemOpenSidePanelPage
        page={SidePanelPages.AskAI}
        pageTitle={msg`Ask AI`}
        pageIcon={IconSparkles}
      />
    ),
    hotKeys: ['@'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS,
    label: msg`View Previous AI Chats`,
    shortLabel: msg`Previous AI Chats`,
    position: 3,
    isPinned: false,
    Icon: IconHistory,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    component: (
      <CommandMenuItemOpenSidePanelPage
        page={SidePanelPages.ViewPreviousAIChats}
        pageTitle={msg`View Previous AI Chats`}
        pageIcon={IconSparkles}
      />
    ),
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticCommandKeys.EDIT_NAVIGATION_SIDEBAR]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: RecordAgnosticCommandKeys.EDIT_NAVIGATION_SIDEBAR,
    label: msg`Edit navigation sidebar`,
    shortLabel: msg`Edit sidebar`,
    position: 4,
    Icon: IconLayout,
    isPinned: false,
    availableOn: [CommandMenuItemViewType.GLOBAL],
    shouldBeRegistered: () => true,
    component: <EditNavigationSidebarNoSelectionRecordCommand />,
  },
};
