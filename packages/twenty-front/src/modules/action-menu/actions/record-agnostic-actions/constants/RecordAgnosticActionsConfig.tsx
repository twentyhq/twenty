import { ActionOpenSidePanelPage } from '@/action-menu/actions/components/ActionOpenSidePanelPage';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { msg } from '@lingui/core/macro';
import { IconSearch, IconSparkles } from 'twenty-ui/display';

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
        page={CommandMenuPages.SearchRecords}
        pageTitle="Search"
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
        page={CommandMenuPages.SearchRecords}
        pageTitle="Search"
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
        page={CommandMenuPages.AskAI}
        pageTitle="Ask AI"
        pageIcon={IconSparkles}
      />
    ),
    hotKeys: ['@'],
    shouldBeRegistered: () => true,
  },
};
