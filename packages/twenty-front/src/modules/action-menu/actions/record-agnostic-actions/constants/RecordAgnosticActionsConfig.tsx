import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { SeeWorkflowsNoSelectionRecordActionEffect } from '@/action-menu/actions/record-actions/no-selection/components/SeeWorkflowsNoSelectionRecordActionEffect';
import { SearchRecordsRecordAgnosticActionEffect } from '@/action-menu/actions/record-agnostic-actions/components/SearchRecordsRecordAgnosticActionEffect';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { msg } from '@lingui/core/macro';
import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSearch,
  IconSettings,
  IconSettingsAutomation,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<
  string,
  ActionConfig
> = {
  [RecordAgnosticActionsKeys.SEARCH_RECORDS]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    component: SearchRecordsRecordAgnosticActionEffect,
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK]: {
    type: ActionMenuEntryType.Fallback,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    component: SearchRecordsRecordAgnosticActionEffect,
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.GO_TO_WORKFLOWS]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_WORKFLOWS,
    label: msg`Go to workflows`,
    shortLabel: msg`See workflows`,
    position: 2,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: SeeWorkflowsNoSelectionRecordActionEffect,
    hotKeys: ['G', 'W'],
  },
  [RecordAgnosticActionsKeys.GO_TO_PEOPLE]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 3,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
  [RecordAgnosticActionsKeys.GO_TO_COMPANIES]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_COMPANIES,
    label: msg`Go to Companies`,
    shortLabel: msg`Companies`,
    position: 4,
    Icon: IconBuildingSkyscraper,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Company }}
      />
    ),
    hotKeys: ['G', 'C'],
  },
  [RecordAgnosticActionsKeys.GO_TO_OPPORTUNITIES]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_OPPORTUNITIES,
    label: msg`Go to Opportunities`,
    shortLabel: msg`Opportunities`,
    position: 5,
    Icon: IconTargetArrow,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Opportunity }}
      />
    ),
    hotKeys: ['G', 'O'],
  },
  [RecordAgnosticActionsKeys.GO_TO_SETTINGS]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_SETTINGS,
    label: msg`Go to Settings`,
    shortLabel: msg`Settings`,
    position: 6,
    Icon: IconSettings,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: <ActionLink to={AppPath.Settings} />,
    hotKeys: ['G', 'S'],
  },
  [RecordAgnosticActionsKeys.GO_TO_TASKS]: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.GO_TO_TASKS,
    label: msg`Go to Tasks`,
    shortLabel: msg`Tasks`,
    position: 7,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Task }}
      />
    ),
    hotKeys: ['G', 'T'],
  },
};
